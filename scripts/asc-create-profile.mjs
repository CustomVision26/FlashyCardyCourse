import crypto from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Ensures an App Store provisioning profile exists for the app and writes it out.
 * Uses the App Store Connect API (no Mac, no devices needed).
 *
 * Env:
 *   ASC_KEY_ID        App Store Connect API key ID
 *   ASC_ISSUER_ID     App Store Connect issuer ID
 *   ASC_P8_PATH       path to the AuthKey_XXXX.p8 file
 *   APP_BUNDLE_ID     e.g. com.flipvise.app
 *   PROFILE_NAME      name for the profile (default: "Flipvise App Store CI")
 *   OUT_PATH          where to write the .mobileprovision (default: ./profile.mobileprovision)
 */
const KEY_ID = process.env.ASC_KEY_ID;
const ISSUER_ID = process.env.ASC_ISSUER_ID;
const P8_PATH = process.env.ASC_P8_PATH;
const BUNDLE_ID = process.env.APP_BUNDLE_ID || "com.flipvise.app";
const PROFILE_NAME = process.env.PROFILE_NAME || "Flipvise App Store CI";
const OUT_PATH = process.env.OUT_PATH || "profile.mobileprovision";

for (const [k, v] of Object.entries({ ASC_KEY_ID: KEY_ID, ASC_ISSUER_ID: ISSUER_ID, ASC_P8_PATH: P8_PATH })) {
  if (!v) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

const API = "https://api.appstoreconnect.apple.com";

function makeToken() {
  const p8 = readFileSync(P8_PATH, "utf8");
  const header = { alg: "ES256", kid: KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 600, aud: "appstoreconnect-v1" };
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const key = crypto.createPrivateKey(p8);
  const sig = crypto.sign("sha256", Buffer.from(signingInput), { key, dsaEncoding: "ieee-p1363" });
  return `${signingInput}.${Buffer.from(sig).toString("base64url")}`;
}

const token = makeToken();

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status}\n${JSON.stringify(body, null, 2)}`);
  }
  return body;
}

function writeProfile(base64Content) {
  writeFileSync(OUT_PATH, Buffer.from(base64Content, "base64"));
  console.log(`Wrote profile to ${OUT_PATH}`);
}

// 1. Reuse an existing profile with this name if present.
const existing = await api(
  `/v1/profiles?filter[name]=${encodeURIComponent(PROFILE_NAME)}&fields[profiles]=name,uuid,profileState,profileContent`,
);
const usable = (existing.data || []).find((p) => p.attributes.profileState === "ACTIVE");
if (usable) {
  console.log(`Reusing existing profile "${PROFILE_NAME}" (uuid ${usable.attributes.uuid})`);
  writeProfile(usable.attributes.profileContent);
  console.log(`PROFILE_NAME=${PROFILE_NAME}`);
  process.exit(0);
}

// 2. Look up the bundle ID resource.
const bundleRes = await api(`/v1/bundleIds?filter[identifier]=${encodeURIComponent(BUNDLE_ID)}&limit=200`);
const bundle = (bundleRes.data || []).find((b) => b.attributes.identifier === BUNDLE_ID);
if (!bundle) {
  throw new Error(`Bundle ID ${BUNDLE_ID} not registered in your Apple Developer account.`);
}

// 3. Gather distribution certificates.
const certRes = await api(`/v1/certificates?filter[certificateType]=DISTRIBUTION&limit=200`);
const certIds = (certRes.data || []).map((c) => c.id);
if (certIds.length === 0) {
  throw new Error("No Distribution certificates found in your account.");
}

// 4. Create the App Store profile.
const created = await api("/v1/profiles", {
  method: "POST",
  body: JSON.stringify({
    data: {
      type: "profiles",
      attributes: { name: PROFILE_NAME, profileType: "IOS_APP_STORE" },
      relationships: {
        bundleId: { data: { type: "bundleIds", id: bundle.id } },
        certificates: { data: certIds.map((id) => ({ type: "certificates", id })) },
      },
    },
  }),
});

console.log(`Created profile "${PROFILE_NAME}" (uuid ${created.data.attributes.uuid})`);
writeProfile(created.data.attributes.profileContent);
console.log(`PROFILE_NAME=${PROFILE_NAME}`);

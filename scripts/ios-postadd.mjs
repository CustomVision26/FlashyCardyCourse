import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Applies the iOS native customizations that can't live in capacitor.config.ts.
 * Runs after `npx cap add ios`, both locally on a Mac and in CI. Idempotent.
 *
 * 1. Copies the custom ExternalBrowser Swift plugin into the App target.
 * 2. Adds an NSAppTransportSecurity exception so the cleartext dev server
 *    (http://localhost:3002) can load.
 * 3. Registers the com.flipvise.app:// URL scheme for the OAuth deep-link return.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "ios", "App", "App");
const infoPlist = path.join(appDir, "Info.plist");
const URL_SCHEME = "com.flipvise.app";

if (process.platform !== "darwin") {
  console.error("scripts/ios-postadd.mjs must run on macOS (needs PlistBuddy).");
  process.exit(1);
}

if (!existsSync(appDir)) {
  console.error(
    `Could not find ${appDir}. Run \`npm run cap:add:ios\` first.`,
  );
  process.exit(1);
}

const PLIST_BUDDY = "/usr/libexec/PlistBuddy";

function plist(command) {
  return execFileSync(PLIST_BUDDY, ["-c", command, infoPlist], {
    encoding: "utf8",
  });
}

/** Returns true when the given plist key path already exists. */
function exists(keyPath) {
  try {
    plist(`Print ${keyPath}`);
    return true;
  } catch {
    return false;
  }
}

async function copyPlugin() {
  const src = path.join(root, "ios-native", "ExternalBrowserPlugin.swift");
  const dest = path.join(appDir, "ExternalBrowserPlugin.swift");
  await mkdir(appDir, { recursive: true });
  await copyFile(src, dest);
  console.log("Copied ExternalBrowserPlugin.swift into ios/App/App/");
}

function addAtsException() {
  if (!exists(":NSAppTransportSecurity")) {
    plist("Add :NSAppTransportSecurity dict");
  }
  if (!exists(":NSAppTransportSecurity:NSAllowsLocalNetworking")) {
    plist("Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true");
    console.log("Added NSAllowsLocalNetworking ATS exception.");
  } else {
    console.log("NSAllowsLocalNetworking already present, skipping.");
  }
}

function addUrlScheme() {
  if (!exists(":CFBundleURLTypes")) {
    plist("Add :CFBundleURLTypes array");
  }
  if (!exists(":CFBundleURLTypes:0")) {
    plist("Add :CFBundleURLTypes:0 dict");
  }
  if (!exists(":CFBundleURLTypes:0:CFBundleURLSchemes")) {
    plist("Add :CFBundleURLTypes:0:CFBundleURLSchemes array");
  }

  // Skip if the scheme is already registered anywhere in the array.
  let alreadyRegistered = false;
  try {
    const dump = plist("Print :CFBundleURLTypes");
    alreadyRegistered = dump.includes(URL_SCHEME);
  } catch {
    alreadyRegistered = false;
  }

  if (alreadyRegistered) {
    console.log(`URL scheme ${URL_SCHEME} already registered, skipping.`);
    return;
  }

  plist(`Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string ${URL_SCHEME}`);
  console.log(`Registered URL scheme ${URL_SCHEME}.`);
}

await copyPlugin();
addAtsException();
addUrlScheme();

console.log("iOS native customizations applied.");

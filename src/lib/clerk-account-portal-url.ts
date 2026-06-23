/**
 * Builds Clerk Account Portal URLs for Capacitor WebViews.
 * Embedded `<SignIn />` often fails on Android due to session/cookie issues;
 * redirecting to the hosted portal avoids the infinite refresh loop.
 *
 * Frontend API host (from publishable key): `xxx.clerk.accounts.dev`
 * Account Portal host (sign-in UI):          `xxx.accounts.dev`
 */
function getClerkFrontendApiHost(): string | null {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) return null;

  try {
    const encoded = pk.replace(/^pk_(test|live)_/, "");
    const decoded = atob(encoded);
    const host = decoded.split("$")[0]?.trim();
    return host || null;
  } catch {
    return null;
  }
}

function getClerkAccountPortalHost(): string | null {
  const configured = process.env.NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL;
  if (configured) {
    try {
      return new URL(configured).host;
    } catch {
      return null;
    }
  }

  const fapiHost = getClerkFrontendApiHost();
  if (!fapiHost) return null;

  if (fapiHost.endsWith(".clerk.accounts.dev")) {
    return fapiHost.replace(".clerk.accounts.dev", ".accounts.dev");
  }

  return fapiHost;
}

export function buildClerkAccountPortalUrl(
  mode: "sign-in" | "sign-up",
  redirectUrl: string,
): string | null {
  const host = getClerkAccountPortalHost();
  if (!host) return null;

  const url = new URL(`https://${host}/${mode}`);
  url.searchParams.set("redirect_url", redirectUrl);
  return url.toString();
}

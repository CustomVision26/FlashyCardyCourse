import { Capacitor } from "@capacitor/core";
import { buildClerkAccountPortalUrl } from "@/lib/clerk-account-portal-url";
import { ExternalBrowser } from "@/lib/external-browser";
import { buildNativeAuthRedirectUrl } from "@/lib/native-auth-redirect";

type NativeClerkAuthMode = "sign-in" | "sign-up";

async function openInSystemBrowser(url: string) {
  if (!Capacitor.isNativePlatform()) {
    window.location.assign(url);
    return;
  }

  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url });
    return;
  } catch (error) {
    console.warn("@capacitor/browser failed, trying ExternalBrowser.", error);
  }

  await ExternalBrowser.open({ url });
}

/** Opens Clerk Account Portal sign-in in the system browser (Chrome). */
export async function openNativeClerkAuth(mode: NativeClerkAuthMode) {
  const redirectUrl = buildNativeAuthRedirectUrl(window.location.origin);
  const signInUrl = buildClerkAccountPortalUrl(mode, redirectUrl);

  if (!signInUrl) {
    throw new Error("Could not build Clerk Account Portal URL.");
  }

  await openInSystemBrowser(signInUrl);
}

export async function closeNativeAuthBrowser() {
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.close();
  } catch {
    // Tab may already be closed.
  }
}

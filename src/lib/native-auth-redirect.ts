/** Path Clerk redirects to after native (system browser) sign-in. */
export const NATIVE_AUTH_CALLBACK_PATH = "/native-auth-complete";

/** Deep link fallback (also allowlist in Clerk → Native applications). */
export const NATIVE_AUTH_DEEP_LINK = "com.flipvise.app://native-auth-complete";

export function buildNativeAuthRedirectUrl(origin: string) {
  return `${origin}${NATIVE_AUTH_CALLBACK_PATH}`;
}

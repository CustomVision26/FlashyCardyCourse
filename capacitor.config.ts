import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Flipvise uses server-side Next.js (Clerk, DB, Server Actions), so the mobile
 * app loads your deployed or local dev server instead of a static export.
 *
 * Set CAPACITOR_SERVER_URL before sync/open:
 * - Dev (device on same Wi‑Fi): http://YOUR_LAN_IP:3000
 * - Production: https://your-app.vercel.app
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.flipvise.app",
  appName: "Flipvise",
  webDir: "mobile-shell",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          allowNavigation: [
            "*.accounts.dev",
            "https://*.accounts.dev",
            "*.clerk.accounts.dev",
            "https://*.clerk.accounts.dev",
            "*.clerk.com",
            "https://*.clerk.com",
            "accounts.google.com",
            "https://accounts.google.com",
            "appleid.apple.com",
            "https://appleid.apple.com",
          ],
        },
      }
    : {}),
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      launchFadeOutDuration: 200,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0a",
    },
  },
};

export default config;

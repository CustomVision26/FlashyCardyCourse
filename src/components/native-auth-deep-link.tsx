"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import {
  closeNativeAuthBrowser,
  openNativeClerkAuth,
} from "@/lib/open-native-clerk-auth";
import {
  NATIVE_AUTH_CALLBACK_PATH,
  NATIVE_AUTH_DEEP_LINK,
} from "@/lib/native-auth-redirect";
import { isNativeApp } from "@/lib/is-native-app";

function pathFromDeepLink(url: string) {
  if (
    !url.includes(NATIVE_AUTH_CALLBACK_PATH) &&
    !url.includes(NATIVE_AUTH_DEEP_LINK)
  ) {
    return null;
  }

  const queryIndex = url.indexOf("?");
  const query = queryIndex !== -1 ? url.slice(queryIndex) : "";
  return `${NATIVE_AUTH_CALLBACK_PATH}${query}`;
}

export function NativeAuthDeepLinkHandler() {
  useEffect(() => {
    if (!isNativeApp()) return;

    const launchListener = App.addListener("appUrlOpen", (event) => {
      const path = pathFromDeepLink(event.url);
      if (!path) return;

      void closeNativeAuthBrowser();
      window.location.href = path;
    });

    void App.getLaunchUrl().then((result) => {
      if (!result?.url) return;
      const path = pathFromDeepLink(result.url);
      if (!path) return;
      void closeNativeAuthBrowser();
      window.location.href = path;
    });

    return () => {
      void launchListener.then((listener) => listener.remove());
    };
  }, []);

  return null;
}

export type NativeClerkAuthMode = "sign-in" | "sign-up";

export async function startNativeClerkAuth(mode: NativeClerkAuthMode) {
  await openNativeClerkAuth(mode);
}

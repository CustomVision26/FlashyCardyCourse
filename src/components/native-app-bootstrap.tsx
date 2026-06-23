"use client";

import { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";
import { isNativeApp } from "@/lib/is-native-app";

export function NativeAppBootstrap() {
  useEffect(() => {
    if (!isNativeApp()) return;
    void SplashScreen.hide();
  }, []);

  return null;
}

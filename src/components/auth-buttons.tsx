"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { isNativeApp } from "@/lib/is-native-app";

type BtnSize = "default" | "sm" | "lg" | "xs";

function NativeAuthLink({
  href,
  label,
  variant = "default",
  size,
}: {
  href: string;
  label: string;
  variant?: "default" | "outline";
  size?: BtnSize;
}) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({
          variant: variant === "outline" ? "outline" : "default",
          size,
        }),
        "min-h-11 w-full sm:w-auto",
      )}
    >
      {label}
    </a>
  );
}

/** Avoid hydration mismatch: native detection only after mount. */
function useIsNativeApp() {
  const [mounted, setMounted] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
    setMounted(true);
  }, []);

  return { mounted, native };
}

export function SignInBtn({ size }: { size?: BtnSize }) {
  const { mounted, native } = useIsNativeApp();

  // SSR + first client paint: same markup as native (link) to match Capacitor WebView.
  if (!mounted || native) {
    return (
      <NativeAuthLink href="/sign-in" label="Sign In" variant="outline" size={size} />
    );
  }

  return (
    <SignInButton mode="modal">
      <Button variant="outline" size={size} className="min-h-11 w-full sm:w-auto">
        Sign In
      </Button>
    </SignInButton>
  );
}

export function SignUpBtn({ size }: { size?: BtnSize }) {
  const { mounted, native } = useIsNativeApp();

  if (!mounted || native) {
    return <NativeAuthLink href="/sign-up" label="Sign Up" size={size} />;
  }

  return (
    <SignUpButton mode="modal">
      <Button size={size} className="min-h-11 w-full sm:w-auto">
        Sign Up
      </Button>
    </SignUpButton>
  );
}

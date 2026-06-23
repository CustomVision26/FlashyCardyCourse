"use client";

import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

type ClerkAuthMode = "sign-in" | "sign-up";

export function ClerkAuthPage({ mode }: { mode: ClerkAuthMode }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      window.location.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center px-4 text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center px-4 py-8">
      {mode === "sign-in" ? (
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
      ) : (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      )}
    </main>
  );
}

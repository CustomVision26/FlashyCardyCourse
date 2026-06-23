"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function NativeAuthCompletePage() {
  return (
    <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center px-4 text-center text-muted-foreground">
      <p className="mb-2">Finishing sign in…</p>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </main>
  );
}

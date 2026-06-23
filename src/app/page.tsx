import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { SignInBtn, SignUpBtn } from "@/components/auth-buttons";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">

      {/* Foreground content stacked: logo → tagline → buttons */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5 text-center sm:gap-6">

        {/* Logo — smaller on phones so buttons stay on screen */}
        <div className="relative w-full max-w-[min(280px,85vw)] sm:max-w-[min(420px,100%)]">
          <Image
            src="/FLIPVISE_logo.png"
            alt="Flipvise"
            width={420}
            height={160}
            className="h-auto w-full object-contain drop-shadow-[0_0_48px_rgba(139,92,246,0.5)]"
            priority
          />
        </div>

        <p className="text-base font-medium text-muted-foreground max-w-sm leading-relaxed sm:text-lg">
          Supercharge your learning with{" "}
          <span className="text-foreground font-semibold">smart flashcards</span>
        </p>

        <div className="relative z-50 flex w-full max-w-xs touch-manipulation flex-col gap-3 pointer-events-auto sm:max-w-none sm:flex-row">
          <SignInBtn />
          <SignUpBtn />
        </div>
      </div>
    </div>
    </main>
  );
}

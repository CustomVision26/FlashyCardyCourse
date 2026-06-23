import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { AppProviders } from "@/components/app-providers";
import { HeaderUserSection } from "@/components/header-user-section";
import { NativeAppBootstrap } from "@/components/native-app-bootstrap";
import { NativeAuthDeepLinkHandler } from "@/components/native-auth-deep-link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAccessContext } from "@/lib/access";
import {
  PRO_UI_THEME_COOKIE,
  resolveProUiThemeDataAttribute,
} from "@/lib/pro-ui-theme";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Flipvise",
  description: "Flashcard app to supercharge your learning",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function isAuthPath(pathname: string) {
  return (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/native-auth-complete")
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const onAuthPage = isAuthPath(pathname);
  const cookieStore = await cookies();
  const proUiThemeCookie = cookieStore.get(PRO_UI_THEME_COOKIE)?.value;

  let isPro = false;
  if (!onAuthPage) {
    ({ isPro } = await getAccessContext());
  }

  const proUiTheme = resolveProUiThemeDataAttribute(isPro, proUiThemeCookie);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased`}
      data-ui-theme={proUiTheme}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <AppProviders>
          <NativeAppBootstrap />
          <NativeAuthDeepLinkHandler />
          <TooltipProvider>
            {!onAuthPage && (
              <header className="flex items-center justify-between border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
                <div className="flex min-w-0 items-center gap-2">
                  <Image
                    src="/FLIPVISE_logo.png"
                    alt="Flipvise logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain sm:h-10"
                    priority
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <HeaderUserSection />
                </div>
              </header>
            )}
            {children}
          </TooltipProvider>
        </AppProviders>
      </body>
    </html>
  );
}

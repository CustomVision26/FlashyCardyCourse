import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Capacitor emulator / LAN device to load Next.js dev assets
  allowedDevOrigins: ["10.0.2.2", "192.168.1.78", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

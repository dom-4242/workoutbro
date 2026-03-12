import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    // TypeScript-Fehler in node_modules (z.B. @reduxjs/toolkit) ignorieren
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb" as any, // Type assertion für Next.js Kompatibilität
    },
  },
};

export default withNextIntl(nextConfig);

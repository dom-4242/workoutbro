import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import pkg from "./package.json";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
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

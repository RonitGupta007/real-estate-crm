import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === "true" ? "standalone" : undefined,
  serverExternalPackages: ["@whiskeysockets/baileys", "pino"],
};

export default nextConfig;

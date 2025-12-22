import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true, // moved out of experimental

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,              // Keep the App Router enabled
    typedRoutes: true,         // Safe routing
    serverActions: {
      allowedOrigins: ["*"],   // Optional, but common in Next 16
    },
    // ✅ This is the key: explicitly enable the Pages Router
    enableUndici: true,        // Required for mixed routing in Next 16
  },

  // ✅ Ensure Next.js recognises .ts/.tsx pages
  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;

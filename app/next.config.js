/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for production — prevents duplicate React runtimes
  experimental: {
    turbo: false,
    reactCompiler: false,
    serverActions: false,
  },

  // Ensure React is resolved consistently across server/client bundles
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    };
    return config;
  },

  // No transpilePackages needed for your project
  transpilePackages: [],
};

module.exports = nextConfig;
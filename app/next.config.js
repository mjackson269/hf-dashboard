/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent Turbopack from splitting React into multiple runtimes
    turbo: {
      resolveAlias: {
        react: require.resolve("react"),
        "react-dom": require.resolve("react-dom"),
      },
    },

    // Disable features that can cause hydration/runtime mismatches
    reactCompiler: false,
    serverActions: false,
  },

  // No transpilePackages needed for your project
  transpilePackages: [],
};

module.exports = nextConfig;
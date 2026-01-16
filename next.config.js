/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for production — Webpack is stable with React 18
  experimental: {
    turbo: false,
    reactCompiler: false,
    serverActions: false
  },

  // Ensure React is resolved consistently across all bundles
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom")
    };
    return config;
  }
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Webpack instead of Turbopack
  experimental: {
    turbo: false,
  },

  // Ensure React is resolved consistently
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    };
    return config;
  },
};

module.exports = nextConfig;
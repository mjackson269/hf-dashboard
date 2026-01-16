/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler is now a top-level key, not inside experimental
  reactCompiler: false,

  // Webpack alias to ensure a single React runtime
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
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler is top-level in Next.js 16
  reactCompiler: false,

  // Explicitly disable Turbopack and use Webpack
  turbopack: false,

  // Ensure a single React runtime across server + client
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
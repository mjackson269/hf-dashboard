/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly disable Turbopack and use Webpack
  turbopack: false,

  // No webpack aliasing — let Next.js handle React resolution
  webpack: (config) => {
    return config;
  },

  // Disable React Compiler (optional)
  reactCompiler: false,
};

module.exports = nextConfig;
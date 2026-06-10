/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js / r3f play nicely with the app router when transpiled
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
  webpack: (config) => {
    // Allow importing GLSL shader files as raw strings.
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;

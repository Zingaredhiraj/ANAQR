/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: 'assets.anatoscan.edu' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  // Deduplicate Three.js — resolve to the local frontend node_modules copy
  webpack(config) {
    const path = require('path');
    // Force all 'three' imports to resolve to the same instance
    config.resolve.alias['three'] = path.resolve(__dirname, 'node_modules/three');
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

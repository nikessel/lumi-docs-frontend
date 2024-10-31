// next.config.js
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource"
    });

    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@pkg': path.resolve(__dirname, './public/pkg'),
    };

    return config;
  },
  
  // Add rewrites for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  }
};

module.exports = nextConfig;

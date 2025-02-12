/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    // Disable webpack caching in development
    if (dev) {
      config.cache = false;
    }
    // Configure module rules
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[hash][ext][query]",
      },
    });
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
      "@pkg": path.resolve(__dirname, "./public/pkg"),
      "@wasm": path.resolve(__dirname, "./public/pkg/app"),
    };
    // Optimize for WebAssembly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    // Add file loaders for WASM
    if (!isServer) {
      config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    }
    return config;
  },
  async rewrites() {
    console.log('Runtime API_URL:', process.env.API_URL);
    console.log('Runtime API_URL_PATH:', process.env.API_URL_PATH);
    
    return [
      {
        source: process.env.API_URL_PATH || '/api/:path*',
        destination: process.env.API_URL || 'http://127.0.0.1:8180/api/:path*',
        basePath: false,
        has: [
          {
            type: 'header',
            key: 'host',
            value: '(?<host>.*)',
          },
        ],
      },
      {
        source: process.env.API_URL_PATH || '/api/:path*',
        destination: process.env.API_URL || 'http://localhost:8180/api/:path*',
      }
    ];
  },
  async headers() {
    console.log('Runtime FORWARDED_HOST:', process.env.FORWARDED_HOST);
    console.log('Runtime FORWARDED_PROTO:', process.env.FORWARDED_PROTO);
    
    return [
      {
        source: process.env.API_URL_PATH || '/api/:path*',
        headers: [
          {
            key: 'x-next-proxy-debug',
            value: 'true',
          },
          {
            key: 'x-forwarded-host',
            value: process.env.FORWARDED_HOST || 'localhost:3000',
          },
          {
            key: 'x-forwarded-proto',
            value: process.env.FORWARDED_PROTO || 'http',
          }
        ],
      },
    ];
  },
};

if (process.env.HOSTNAME) {
  process.env.HOST = process.env.HOSTNAME;  // Ensure HOST is also set
}

export default nextConfig;

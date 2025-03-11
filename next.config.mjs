/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  output: 'standalone',
  // Add the experimental configuration for server actions
  experimental: {
    // Increase the body size limit for server actions
    serverActions: {
      // Set to 50MB (adjust as needed)
      bodySizeLimit: '50mb',
    },
    // Keep any other experimental features if they exist
  },
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
  }
};

if (process.env.HOSTNAME) {
  process.env.HOST = process.env.HOSTNAME;
}

export default nextConfig;

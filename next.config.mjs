/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
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
    });

    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
      "@pkg": path.resolve(__dirname, "./public/pkg"),
      "@wasm": path.resolve(__dirname, "./public/pkg/lumi_docs_app"),
    };

    // Optimize for WebAssembly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  // Add rewrites for development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;

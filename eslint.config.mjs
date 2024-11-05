import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use dynamic import for Next.js plugin
const nextPlugin = (await import("@next/eslint-plugin-next")).default;

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Define config array first
const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      next: nextPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-interface": "off",
    },
    settings: {
      next: {
        rootDir: ".",
      },
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/public/pkg/**",
      "**/src/pkg/**",
      "**/*.d.ts",
      "**/*.wasm",
    ],
  },
];

// Export the config
export default eslintConfig;

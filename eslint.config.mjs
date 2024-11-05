// eslint.config.mjs
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup compatibility layer
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Load plugins
const nextPlugin = (await import("@next/eslint-plugin-next")).default;
const typescriptPlugin = (await import("@typescript-eslint/eslint-plugin"))
  .default;
const typescriptParser = (await import("@typescript-eslint/parser")).default;

const eslintConfig = [
  // Core ESLint config
  js.configs.recommended,

  // Next.js config
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),

  // JavaScript/TypeScript files config
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        project: null, // Don't require tsconfig for JS files
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
      "no-mixed-spaces-and-tabs": "error",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // TypeScript-specific config
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Config files
  {
    files: ["*.config.{js,ts,mjs}", "postcss.config.mjs", "next.config.mjs"],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },

  // Ignore patterns
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

export default eslintConfig;

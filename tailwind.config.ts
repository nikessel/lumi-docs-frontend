import type { Config } from "tailwindcss";
const theme = require('./src/styles/theme');

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        small_custom: theme.fontSizes.small,
        default_custom: theme.fontSizes.default,
        h1_custom: theme.fontSizes.h1,
        h2_custom: theme.fontSizes.h2,
        h3_custom: theme.fontSizes.h3,
        h4_custom: theme.fontSizes.h4,
        h5_custom: theme.fontSizes.h5,
        h6_custom: theme.fontSizes.h6,
      },
      colors: {
        primary: theme.colors.primary,
        text_primary: theme.colors.text_primary,
        text_secondary: theme.colors.text_secondary,
        bg_primary: theme.colors.bg_primary,
        bg_secondary: theme.colors.bg_secondary,
        muted: theme.colors.muted,
      },
      borderRadius: {
        default: theme.borderRadius.default,
        large: theme.borderRadius.large,
      },
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};

export default config;

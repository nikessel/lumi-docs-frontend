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
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'border-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'border-flow': 'border-flow 2s linear infinite'
      }
    },
    container: {
      center: true,  // Changed from 'true' to true
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
};

export default config;

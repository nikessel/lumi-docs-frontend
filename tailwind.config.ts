import type { Config } from "tailwindcss";
const colors = require('./src/styles/colors');
import { selectedTheme } from "./antd-config";

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
        small_custom: '12px',
        default_custom: '14px',
        h1_custom: '38px',
        h2_custom: '30px',
        h3_custom: '24px',
        h4_custom: '20px',
        h5_custom: '16px',
        h6_custom: '14px',
      },
      colors: {
        'primary': colors[selectedTheme].primary,
        'text_primary': colors[selectedTheme].text_primary,
        'text_secondary': colors[selectedTheme].text_secondary,
      },

    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        "2xl": "1400px",
      },
    }
  },
  plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar')],
};
export default config;

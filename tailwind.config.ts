import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        heritage: {
          burgundy: "#741A2B",
          wine: "#3A101A",
          saffron: "#C65A36",
          gold: "#C69A4A",
          "gold-light": "#E2C38E",
          ivory: "#FBF7F0",
          cream: "#F4EDE2",
          sand: "#EFE6D8",
          text: "#261B1E",
          muted: "#786B68",
          border: "#E7DDD4",
        },
        brand: {
          primary: "#741A2B", // Primary Burgundy
          dark: "#3A101A",    // Dark Wine
          saffron: "#C65A36", // Saffron accent
          gold: "#C69A4A",    // Antique Gold
          light: "#FBF7F0",   // Warm Ivory
          cream: "#F4EDE2",   // Cream
          white: "#FFFFFF",
          body: "#261B1E",    // Primary Text
          muted: "#786B68",   // Secondary Text
          border: "#E7DDD4",  // Border
          success: "#1E7E55",
          warning: "#C65A36",
          error: "#A32D2D",
        },
        academic: {
          50: "#FAF6F0",
          100: "#F4ECE1",
          200: "#E7DDD4",
          300: "#D3C3B5",
          400: "#9C8B7E",
          500: "#786B68",
          600: "#5D514E",
          700: "#443936",
          800: "#322926",
          900: "#261B1E",
          950: "#1A1114",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-lora)", "Lora", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(38, 27, 30, 0.05)",
        card: "0 4px 16px -2px rgba(58, 16, 26, 0.06), 0 2px 6px -1px rgba(58, 16, 26, 0.04)",
        hover: "0 10px 25px -4px rgba(116, 26, 43, 0.10), 0 4px 10px -2px rgba(58, 16, 26, 0.06)",
        gold: "0 4px 20px -2px rgba(198, 154, 74, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;

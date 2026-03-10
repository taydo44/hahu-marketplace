import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teff: {
          50: "#fdf6ed",
          100: "#f9e8cc",
          200: "#f3cf95",
          300: "#ecb05a",
          400: "#e6952e",
          500: "#d97b16",
          600: "#be5f10",
          700: "#9d4510",
          800: "#7f3714",
          900: "#682f14",
          950: "#3b1609",
        },
        injera: {
          50: "#f9f6f0",
          100: "#f0e9d8",
          200: "#e2d1b0",
          300: "#cfb480",
          400: "#be9558",
          500: "#b07d3e",
          600: "#966534",
          700: "#7a4e2c",
          800: "#65402a",
          900: "#563727",
          950: "#2e1c12",
        },
        walia: {
          50: "#f0f9f0",
          100: "#daf0da",
          200: "#b6e0b7",
          300: "#84ca87",
          400: "#50ae55",
          500: "#2d9133",
          600: "#1f7325",
          700: "#1a5c20",
          800: "#17491d",
          900: "#143c1a",
          950: "#092110",
        },
        harar: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#6b1c1c",
        },
        axum: {
          50: "#f8f8f6",
          100: "#eeeee8",
          200: "#ddddd3",
          300: "#c4c4b5",
          400: "#a8a893",
          500: "#909077",
          600: "#787862",
          700: "#636351",
          800: "#525245",
          900: "#45453b",
          950: "#252520",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "teff-gradient": "linear-gradient(135deg, #3b1609 0%, #682f14 40%, #9d4510 100%)",
        "hero-texture":
          "radial-gradient(ellipse at 20% 50%, rgba(217,123,22,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(45,145,51,0.1) 0%, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#09070f",
          900: "#0f0c1b",
          850: "#151124",
          800: "#1b162f",
          700: "#272042",
          600: "#372e5c",
          500: "#4f4382",
          400: "#7b6cb8",
        },
        electric: {
          300: "#e9d5ff",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
        violetAccent: {
          300: "#f3e8ff",
          400: "#d8b4fe",
          500: "#c084fc",
          600: "#8b5cf6",
          700: "#7c3aed",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-glow": "radial-gradient(at 0% 0%, rgba(192, 132, 252, 0.18) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.16) 0px, transparent 50%)",
        "hero-gradient": "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.12) 50%, rgba(192, 132, 252, 0.08) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

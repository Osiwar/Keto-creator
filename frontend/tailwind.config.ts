import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#FDFAF5", alt: "#F7F2EA" },
        surface: "#FFFFFF",
        accent: { DEFAULT: "#E8620A", dark: "#C4500A", light: "#FFF0E6" },
        brand: { text: "#1C0A00", muted: "#7A5C46", light: "#B09080" },
        border: { DEFAULT: "#E8DDD2", light: "#F0E8DE" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        card: "0 2px 16px rgba(28,10,0,0.08)",
        "card-hover": "0 8px 40px rgba(232,98,10,0.12)",
        accent: "0 4px 20px rgba(232,98,10,0.3)",
        "accent-lg": "0 8px 40px rgba(232,98,10,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

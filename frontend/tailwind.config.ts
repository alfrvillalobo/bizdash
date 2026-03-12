import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F1117",
          secondary: "#161B27",
          card: "#1C2333",
        },
        border: { DEFAULT: "#2A3347" },
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          soft: "rgba(99,102,241,0.12)",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
    },
  },
  plugins: [],
};

export default config;
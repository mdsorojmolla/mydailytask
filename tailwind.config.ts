import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2723",
        muted: "#68746e",
        paper: "#fbfaf7",
        surface: "#ffffff",
        line: "#dedbd2",
        accent: "#3d6f63",
        accentSoft: "#e3eee9",
        warning: "#8a5f24",
        danger: "#9b3f3f"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 39, 35, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

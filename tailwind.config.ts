import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#1A1D2E",
        inkLight: "#3B4054",
        muted: "#7E8494",
        mutedLight: "#A3A8B8",
        paper: "#F7F8FD",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        line: "#E9ECF2",
        lineLight: "#F0F2F7",
        accent: "#5B4DFB",
        accentSoft: "#EEECFE",
        accentHover: "#483AE3",
        warning: "#F59E0B",
        danger: "#EF4444",
        // Event type semantic tints matching reference
        classTint: "#3B82F6",
        classBg: "#EFF6FF",
        classBorder: "#DBEAFE",
        taskTint: "#5B4DFB",
        taskBg: "#EEECFE",
        taskBorder: "#DDD8FD",
        activityTint: "#F97316",
        activityBg: "#FFF7ED",
        activityBorder: "#FFEDD5"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(91, 77, 251, 0.08)",
        card: "0 4px 20px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)",
        sheet: "0 -8px 30px rgba(0, 0, 0, 0.12)",
        glow: "0 8px 24px rgba(91, 77, 251, 0.35)",
        floating: "0 12px 28px rgba(91, 77, 251, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;

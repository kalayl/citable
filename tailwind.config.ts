import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep navy ink scale
        navy: {
          950: "#070A11",
          900: "#0A0E17",
          850: "#0E1420",
          800: "#131B2B",
          700: "#1C2740",
          600: "#2A3A5C",
        },
        // Electric cyan accent — "citation" blue
        cite: {
          300: "#8FEEFF",
          400: "#49E3FF",
          500: "#1FD2F4",
          600: "#0FAFD1",
        },
        // Warm amber for warnings
        amber: {
          300: "#FFD28A",
          400: "#F7B955",
        },
        paper: "#EEF2F8",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bar-grow": "barGrow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        scan: "scan 1.6s ease-in-out infinite",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        barGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(350%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

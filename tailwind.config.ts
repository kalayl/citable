import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "white" on this site is warm paper, never pure white
        white: "#FBF8F1",
        paper: {
          DEFAULT: "#F5F0E8",
          deep: "#EFE8DB",
        },
        ink: "#1A1A2E",
        // Warm ink-tinted neutral scale (parchment -> ink)
        gray: {
          50: "#FAF6EE",
          100: "#F2EBDD",
          200: "#E0D6C2",
          300: "#C7BAA0",
          400: "#998F7C",
          500: "#6E6658",
          600: "#524C42",
          700: "#3A3732",
          800: "#262530",
          900: "#1A1A2E",
        },
        // Sepia / faded red accent — the cartographer's second ink
        accent: {
          50: "#F3E7DA",
          100: "#EBD8C3",
          500: "#A0522D",
          600: "#8B4513",
          700: "#6E3610",
        },
        // Ink-wash verdict colours (muted, watercolour)
        red: {
          50: "#F2E2DC",
          100: "#EAD2C9",
          400: "#B04A38",
          500: "#9B3B2E",
          600: "#8A3526",
        },
        amber: {
          50: "#F3EAD5",
          100: "#EDE0C2",
          300: "#C99D3F",
          400: "#B8860B",
          600: "#96700E",
          700: "#7D5E0C",
        },
        emerald: {
          50: "#E5EBDE",
          100: "#D7E1CC",
          600: "#55724E",
          700: "#475F41",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        hand: ["var(--font-hand)", "cursive"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "bar-grow": "barGrow 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        barGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

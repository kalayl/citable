import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Prototype F: clean white system-diagram aesthetic
        white: "#FFFFFF",
        paper: {
          DEFAULT: "#FAFBFA",
          deep: "#F1F3F0",
        },
        ink: "#15181A",
        // Cool neutral scale with a faint green undertone
        gray: {
          50: "#F7F8F6",
          100: "#F3F5F2",
          200: "#E2E5E0",
          300: "#C9CDC6",
          400: "#8A9086",
          500: "#5A6058",
          600: "#4A5147",
          700: "#363B34",
          800: "#232722",
          900: "#15181A",
        },
        // Green accent (prototype F primary)
        accent: {
          50: "#E7EDE5",
          100: "#CFDCCB",
          500: "#637F5B",
          600: "#55724E",
          700: "#475F41",
        },
        // Diagram label blue
        signal: "#2563EB",
        red: {
          50: "#FBEAE7",
          100: "#F5D4CD",
          400: "#C2503C",
          500: "#AD4231",
          600: "#993A2A",
        },
        amber: {
          50: "#FBF3DE",
          100: "#F5E7C2",
          300: "#D4A437",
          400: "#BE8E12",
          600: "#9C7510",
          700: "#80600D",
        },
        emerald: {
          50: "#E7EDE5",
          100: "#CFDCCB",
          600: "#55724E",
          700: "#475F41",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "ui-monospace", "monospace"],
        mono: ["var(--font-hand)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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

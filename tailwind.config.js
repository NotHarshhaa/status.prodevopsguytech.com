/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Outfit",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        accent: {
          DEFAULT: "#00d4aa",
          dark: "#00b894",
          glow: "rgba(0, 212, 170, 0.35)",
        },
        status: {
          operational: "#10b981",
          degraded: "#f59e0b",
          outage: "#ef4444",
          maintenance: "#6366f1",
          "dot-operational": "#10b981",
          "dot-degraded": "#f59e0b",
          "dot-outage": "#ef4444",
          "dot-maintenance": "#6366f1",
          "dot-unknown": "#94a3b8",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 170, 0.25)",
        "glow-lg": "0 0 40px rgba(0, 212, 170, 0.2)",
        card: "0 4px 16px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 12px 32px rgba(0, 212, 170, 0.08)",
      },
    },
  },
  plugins: [],
};

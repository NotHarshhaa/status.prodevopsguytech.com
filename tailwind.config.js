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
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        status: {
          operational: "#1a7f37",
          degraded: "#bf8700",
          outage: "#cf222e",
          maintenance: "#0969da",
          "dot-operational": "#1a7f37",
          "dot-degraded": "#bf8700",
          "dot-outage": "#cf222e",
          "dot-maintenance": "#0969da",
          "dot-unknown": "#8b949e",
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          950: "#0B1220",
          900: "#111C31",
          800: "#182642",
          700: "#243657",
          600: "#33507F",
          500: "#5C79A8",
          400: "#7C93B8",
          300: "#A6B8D4",
          200: "#C7D2E4",
          50: "#F4F6FB",
        },
        stamp: {
          amber: "#C7841E",
          green: "#2E7D5B",
          rust: "#B14A3C",
        },
      },
      fontFamily: {
        display: ["'Spectral'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

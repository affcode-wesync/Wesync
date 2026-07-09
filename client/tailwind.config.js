/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a25",
          600: "#252530",
          500: "#35354a",
        },
        accent: {
          DEFAULT: "#6c5ce7",
          hover: "#7d6ff0",
          light: "#a29bfe",
        },
      },
    },
  },
  plugins: [],
};

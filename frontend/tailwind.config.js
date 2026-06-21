/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#030303",
          card: "rgba(17, 17, 19, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
          glow: "rgba(26, 115, 232, 0.15)",
        }
      },
      fontFamily: {
        sans: ['"Google Sans Text"', 'Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

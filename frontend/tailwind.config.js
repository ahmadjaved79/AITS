/** @type {import('tailwindcss').config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1d4ed8',
          light: '#dbeafe',
          50: '#eff6ff'
        }
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#8A7650',      // Main headers, buttons, links
        secondary: '#6F7B60',    // Darker green for better contrast on surface
        background: '#ECE7D1',   // Page background
        surface: '#DBCEA5',      // Cards, panels
        accent: '#C79D4B',      //for highlights
        info: '#6A8D8A',        // Muted teal, earthy and cohesive
        danger: '#C94C4C',       // Red for errors/warnings

        // Dark mode (optional: prefixed or via class strategy)
        dark: {
          background: '#1E1A15',
          surface: '#322C23',
          primary: '#D9C4A7',
          secondary: '#A1A78D',
          accent: '#E5B85F',
          info: '#70907F',
          danger: '#C8655B'
        }

      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'] // Optional, for nicer font
      }
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- IMPORTANT : Active le mode classe
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../apps/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0528d6",
        secondary: "#F76513",
        dark: "#0f1323",
        light: "#FAFAFA",
      },
      borderRadius: {
        'modern': '2rem',
        'huge': '3rem',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
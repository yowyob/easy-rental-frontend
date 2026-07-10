/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('../../packages/shared-ui/tailwind.config.js')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0528d6',
          dark: '#041FA3',
          light: '#3D5AFE',
        },
        secondary: {
          DEFAULT: '#F76513',
        },
        background: '#FAFAFA',
        gray: {
          DEFAULT: '#A6A6A6',
        },
        white: '#FFFFFF',
        black: '#000000',
      },
    },
  },
  plugins: [],
};

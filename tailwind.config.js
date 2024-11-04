const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundOpacity: {
        15: '0.15',
      },
      width: {
        500: '500px',
      },
      height: {
        500: '500px',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        gray: {
          50: '#f9fafb',
          100: '#eaeaeb',
          200: '#cacbcd',
          300: '#a7a9ac',
          400: '#696c71',
          500: '#282d34',
          600: '#24292f',
          700: '#181b20',
          800: '#121518',
          900: '#0c0e10',
        },
        primary: {
          50: '#FFFFFF',
          100: '#F4F1FE',
          200: '#D5CAFC',
          300: '#B7A4F9',
          400: '#987DF7',
          500: '#7A57F5',
          600: '#5022F2',
          700: '#380DCF',
          800: '#2A099A',
          900: '#1B0665',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        ],
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
};

const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out forwards',
        'slide-up':
          'slide-up 0.3s ease-in-out var(--slide-up-delay, 0) forwards',
      },
      backgroundImage: {
        'vibrant-october-silence':
          'linear-gradient(-20deg, #b721ff 0%, #21d4fd 100%);',
        'vibrant-deep-blue':
          'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        'vibrant-box':
          'linear-gradient(to left top, #5022f2, #7a0ed8, #8e00bf, #9900a8, #9d1094)',
        'headline': 'linear-gradient( 135deg, #3C8CE7 10%, #00EAFF 100%)',
      },
      backgroundOpacity: {
        15: '0.15',
      },
      borderRadius: {
        'none': '0px',
        '3': '3px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        ...defaultTheme.boxShadow,
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      aspectRatio: {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
        11: '11',
        12: '12',
        13: '13',
        14: '14',
        15: '15',
        16: '16',
        17: '17',
        18: '18',
        19: '19',
        20: '20',
        21: '21',
        22: '22',
        23: '23',
        24: '24',
        25: '25',
        26: '26',
        27: '27',
        28: '28',
        29: '29',
        30: '30',
      },
      spacing: {
        px: '1px',
        0: '0px',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
        500: '500px',
      },
      width: ({ theme }) => ({
        'auto': 'auto',
        ...theme('spacing'),
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
        '1/5': '20%',
        '2/5': '40%',
        '3/5': '60%',
        '4/5': '80%',
        '1/6': '16.666667%',
        '2/6': '33.333333%',
        '3/6': '50%',
        '4/6': '66.666667%',
        '5/6': '83.333333%',
        '1/12': '8.333333%',
        '2/12': '16.666667%',
        '3/12': '25%',
        '4/12': '33.333333%',
        '5/12': '41.666667%',
        '6/12': '50%',
        '7/12': '58.333333%',
        '8/12': '66.666667%',
        '9/12': '75%',
        '10/12': '83.333333%',
        '11/12': '91.666667%',
        'full': '100%',
        'screen': '100vw',
        'min': 'min-content',
        'max': 'max-content',
        'fit': 'fit-content',
      }),
      minWidth: ({ theme }) => ({
        ...theme('width'),
      }),
      maxWidth: ({ theme }) => ({
        ...theme('width'),
      }),
      height: ({ theme }) => ({
        ...theme('spacing'),
      }),
      minHeight: ({ theme }) => ({
        ...theme('height'),
      }),
      maxHeight: ({ theme }) => ({
        ...theme('height'),
      }),
      container: ({ theme, breakpoints }) => {
        // only assign last breakpoint for enabling a fluid container
        const bps = breakpoints(theme('screens'));
        const [key, value] = Object.entries(bps).at(-1);

        return {
          center: true,
          screens: {
            [key]: value,
          },
          padding: {
            DEFAULT: '1rem',
          },
        };
      },
      space: ({ theme }) => ({
        ...theme('spacing'),
      }),
      colors: {
        'inherit': 'inherit',
        'current': 'currentColor',
        'transparent': 'transparent',
        'black': '#000',
        'white': '#fff',

        'primary': {
          DEFAULT: '#7A57F5',
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

        'terracotta': {
          DEFAULT: '#E77D60',
          50: '#FFFFFF',
          100: '#FCF1EE',
          200: '#F7D4CA',
          300: '#F2B7A7',
          400: '#EC9A83',
          500: '#E77D60',
          600: '#E0552F',
          700: '#BB3E1C',
          800: '#8A2E15',
          900: '#591E0D',
        },

        'purple-heart': {
          DEFAULT: '#7126AF',
          50: '#CAA2EB',
          100: '#C091E7',
          200: '#AD70E0',
          300: '#9A4ED9',
          400: '#872DD1',
          500: '#7126AF',
          600: '#531C81',
          700: '#351253',
          800: '#180825',
          900: '#000000',
        },

        'rose': {
          DEFAULT: '#EA33DF',
          50: '#FBD9F9',
          100: '#F9C7F6',
          200: '#F5A2F0',
          300: '#F27DEB',
          400: '#EE58E5',
          500: '#EA33DF',
          600: '#D015C4',
          700: '#9D1094',
          800: '#6A0B64',
          900: '#370634',
        },

        'slate': {
          DEFAULT: colors.slate['500'],
          ...colors.slate,
        },
        'gray': {
          DEFAULT: colors.gray['500'],
          ...colors.gray,
        },
        'zinc': {
          DEFAULT: colors.zinc['500'],
          ...colors.zinc,
        },
        'neutral': {
          DEFAULT: colors.neutral['500'],
          ...colors.neutral,
        },
        'stone': {
          DEFAULT: colors.stone['500'],
          ...colors.stone,
        },
        'red': {
          DEFAULT: colors.red['500'],
          ...colors.red,
        },
        'orange': {
          DEFAULT: colors.orange['500'],
          ...colors.orange,
        },
        'amber': {
          DEFAULT: colors.amber['500'],
          ...colors.amber,
        },
        'yellow': {
          DEFAULT: colors.yellow['500'],
          ...colors.yellow,
        },
        'lime': {
          DEFAULT: colors.lime['500'],
          ...colors.lime,
        },
        'green': {
          DEFAULT: colors.green['500'],
          ...colors.green,
        },
        'emerald': {
          DEFAULT: colors.emerald['500'],
          ...colors.emerald,
        },
        'teal': {
          DEFAULT: colors.teal['500'],
          ...colors.teal,
        },
        'cyan': {
          DEFAULT: colors.cyan['500'],
          ...colors.cyan,
        },
        'sky': {
          DEFAULT: colors.sky['500'],
          ...colors.sky,
        },
        'blue': {
          DEFAULT: colors.blue['500'],
          ...colors.blue,
        },
        'indigo': {
          DEFAULT: colors.indigo['500'],
          ...colors.indigo,
        },
        'violet': {
          DEFAULT: colors.violet['500'],
          ...colors.violet,
        },
        'purple': {
          DEFAULT: colors.purple['500'],
          ...colors.purple,
        },
        'fuchsia': {
          DEFAULT: colors.fuchsia['500'],
          ...colors.fuchsia,
        },
        'pink': {
          DEFAULT: colors.pink['500'],
          ...colors.pink,
        },
      },
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
        'mono': ['JetBrains Mono', ...defaultTheme.fontFamily.sans],
        'inter': ['Inter', ...defaultTheme.fontFamily.sans],
        'jetbrains-mono': ['JetBrains Mono', ...defaultTheme.fontFamily.sans],
        'syne': ['Syne', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        'xs': ['0.75rem', '1rem'],
        'sm': ['0.875rem', '1.25rem'],
        'base': ['1rem', '1.5rem'],
        'lg': ['1.125rem', '1.75rem'],
        'xl': ['1.25rem', '1.75rem'],
        '2xl': ['1.5rem', '2rem'],
        '3xl': ['1.875rem', '2.25rem'],
        '4xl': ['2.25rem', '2.5rem'],
        '5xl': ['3rem', '1'],
        '6xl': ['3.75rem', '1'],
        '7xl': ['4.5rem', '1'],
        '8xl': ['6rem', '1'],
        '9xl': ['8rem', '1'],
        '10xl': ['10rem', '1'],
        '11xl': ['11rem', '1'],
        '12xl': ['12rem', '1'],
        '13xl': ['13rem', '1'],
        '14xl': ['14rem', '1'],
        '15xl': ['15rem', '1'],
        '16xl': ['16rem', '1'],
        'header': ['4rem', '1'],
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
      zIndex: {
        '-1': -1,
        'header': 1000,
        'off-canvas': 1100,
        'menu-button': 1200,
        'max': 2147483647,
      },
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        7: '7',
        8: '8',
        9: '9',
        10: '10',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.white'),

            // ...
          },
        },
      }),
    },
  },
  variants: {
    lineClamp: ['responsive', 'hover'],
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    plugin(function ({ addBase, addComponents, theme }) {
      addBase({
        h1: { fontSize: theme('fontSize.2xl') },
        h2: { fontSize: theme('fontSize.xl') },
        h3: { fontSize: theme('fontSize.lg') },
      });
      addComponents({
        '.drop-shadow-card-header': {
          filter:
            'drop-shadow(0 0 25px rgb(0 0 0 / 0.15)) drop-shadow(0 0 15px rgb(0 0 0 / 0.4)) drop-shadow(0 0 10px rgb(0 0 0 / 0.5))',
        },
        '.glass': {
          backdropFilter: 'blur(10px)',
          color: 'rgba(255, 255, 255, 1)',
          userSelect: 'none',
        },
        '.glass-light': {
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        },
      });
    }),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
};

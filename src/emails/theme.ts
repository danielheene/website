// oxlint-disable typescript/unbound-method
import type { TailwindConfig } from 'react-email'
import { pixelBasedPreset } from 'react-email'

import plugin from 'tailwindcss/plugin'

import PPFrama from '@/fonts/pp-frama/email'
import PPSupplyMono from '@/fonts/pp-supply-mono/email'

/**
 * Light and dark values of the frontend's theme tokens (`_colors.css`), as hex: most inboxes,
 * notably Outlook desktop, don't understand `oklch()` or `light-dark()`. Light is the default;
 * the `dark:` variant (`prefers-color-scheme`) switches to the `-dark` values where the client
 * supports it. The dark border is 10% white in the theme, blended here over the dark background
 * because Outlook ignores alpha.
 */
const tokens = {
  background: ['#FFFFFF', '#0A0A0A'],
  foreground: ['#0A0A0A', '#FAFAFA'],
  card: ['#FFFFFF', '#171717'],
  'card-foreground': ['#0A0A0A', '#FAFAFA'],
  muted: ['#F5F5F5', '#262626'],
  'muted-foreground': ['#737373', '#A1A1A1'],
  border: ['#E5E5E5', '#232323'],
  'primary-foreground': ['#EFF6FF', '#EFF6FF'],
} as const

const tokenColors = Object.fromEntries(
  Object.entries(tokens).flatMap(([name, [light, dark]]) => [
    [name, light],
    [`${name}-dark`, dark],
  ]),
)

const fontStack = (font: { family: string; fallback: readonly string[] }) => [
  `'${font.family}'`,
  ...font.fallback,
]

/**
 * Tailwind theme for the React Email templates, adapted from the frontend's.
 *
 * `react-email`'s bundled Tailwind compiles utility classes into inline styles at render time, so
 * it can't read the site's CSS-first theme (`src/styles/theme/*.css`). This file re-declares what
 * email clients can render: the theme tokens and the primary scale as hex, the font roles (body
 * PP Frama Text like `font-sans`, headlines PP Supply Sans, small print PP Supply Mono like
 * `font-mono`, loaded by `EmailFonts`), and the radius scale (`_radii.css`) in px.
 * `pixelBasedPreset` turns Tailwind's rem-based spacing and text scale, which the frontend uses
 * unchanged, into px, since email clients handle relative units inconsistently.
 *
 * Keep the values in sync with `src/styles/theme/_colors.css` and `src/styles/theme/_radii.css`.
 */
export const emailTheme: TailwindConfig = {
  plugins: [
    plugin(({ addVariant }) => {
      // the container's max width, below which the layout tightens its padding
      addVariant('mobile', '@media (max-width: 600px)')
    }),
  ],
  presets: [pixelBasedPreset],

  theme: {
    extend: {
      colors: {
        ...tokenColors,
        primary: {
          50: '#E9E9FE',
          100: '#D6D7FD',
          200: '#AEAFFC',
          300: '#8587FA',
          400: '#575AF7',
          500: '#1D27F2',
          600: '#131CC7',
          700: '#0D15A3',
          800: '#070D7A',
          900: '#030653',
          950: '#010236',
          DEFAULT: '#1D27F2',
        },
        white: '#FFFFFF',
        black: '#000000',
      },
      fontFamily: {
        sans: fontStack(PPFrama),
        heading: fontStack(PPSupplyMono),
        mono: fontStack(PPSupplyMono),
      },
      borderRadius: {
        xs: '2px',
        sm: '3px',
        DEFAULT: '6px',
        md: '9px',
        lg: '11px',
        xl: '14px',
        full: '9999px',
      },
    },
  },
}

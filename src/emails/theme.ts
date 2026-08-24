import type { TailwindConfig } from 'react-email'
import { pixelBasedPreset } from 'react-email'

/**
 * Tailwind theme for React Email templates.
 *
 * `react-email`'s bundled Tailwind compiler compiles utility classes into literal inline
 * styles at render time, so it can't read the site's CSS-first Tailwind v4
 * theme (`src/styles/theme/*.css`) the way the Next.js app does. This file
 * re-declares the subset of that theme email clients can actually render:
 *
 * - Brand colors as hex, converted from the `oklch()` values in
 *   `_colors.css` (most inboxes, notably Outlook desktop, don't understand
 *   `oklch()`).
 * - The neutral scale, using the hex values already documented as comments
 *   in `_colors.css`.
 * - The font fallback stack Next.js falls back to before the self-hosted
 *   webfont loads (`src/fonts/pp-frama-text/next.ts`) — email clients never
 *   load the webfont at all, so the fallback *is* the font.
 * - The site's border-radius scale (`_radii.css`), converted from `rem` to
 *   `px` since email clients handle relative units inconsistently.
 *
 * `pixelBasedPreset` swaps Tailwind's default rem-based spacing/font-size
 * scale for a px-based one, for the same reason.
 *
 * Keep the values below in sync with `src/styles/theme/_colors.css`,
 * `src/styles/theme/_fonts.css`, and `src/styles/theme/_radii.css`.
 */
export const emailTheme: TailwindConfig = {
  theme: {
    extend: {
      ...pixelBasedPreset.theme.extend,
      colors: {
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
        secondary: {
          50: '#CBFCF1',
          100: '#B7FBEC',
          200: '#91F9E2',
          300: '#6AF6D8',
          400: '#44F4CE',
          500: '#1DF2C4',
          600: '#0BCBA2',
          700: '#099678',
          800: '#06614D',
          900: '#032C23',
          950: '#01120E',
          DEFAULT: '#1DF2C4',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A1A1A1',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        white: '#FFFFFF',
        black: '#000000',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
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

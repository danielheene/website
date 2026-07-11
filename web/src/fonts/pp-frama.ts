import localFont from 'next/font/local'

export const PPFrama = localFont({
  variable: '--pp-frama',
  preload: true,
  src: [
    {
      path: '../../public/fonts/pp-frama/pp-frama-100-normal.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-100-italic.woff2',
      weight: '100',
      style: 'italic  ',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-200-normal.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-200-italic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-300-normal.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-300-italic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-400-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-500-italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-700-italic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-900-normal.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-frama/pp-frama-900-italic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  adjustFontFallback: false,
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji',
  ],
})

export default PPFrama

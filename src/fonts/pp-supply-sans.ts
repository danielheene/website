import localFont from 'next/font/local'

export const PPSupplySans = localFont({
  variable: '--pp-supply-sans',
  preload: true,
  src: [
    {
      path: '../../public/fonts/pp-supply-sans/pp-supply-sans-200.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-sans/pp-supply-sans-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-sans/pp-supply-sans-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-sans/pp-supply-sans-700.woff2',
      weight: '700',
      style: 'normal',
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

export default PPSupplySans

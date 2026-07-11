import localFont from 'next/font/local'

export const PPSupplyMono = localFont({
  variable: '--pp-supply-mono',
  preload: true,
  src: [
    {
      path: '../../public/fonts/pp-supply-mono/pp-supply-mono-200.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-mono/pp-supply-mono-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-mono/pp-supply-mono-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  adjustFontFallback: false,
  display: 'swap',
  fallback: [
    'ui-monospace',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
  ],
})

export default PPSupplyMono

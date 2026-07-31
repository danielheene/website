import localFont from 'next/font/local'

export const PPSupplyMono = localFont({
  variable: '--pp-supply-mono',
  preload: true,
  src: [
    {
      path: './files/pp-supply-mono-200.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-200.woff2',
      weight: '100',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-200.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-200.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-400.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-400.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-400.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-500.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-500.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-500.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: './files/pp-supply-mono-700.woff2',
      weight: '900',
      style: 'italic',
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

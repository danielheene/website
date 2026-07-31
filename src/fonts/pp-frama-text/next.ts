import localFont from 'next/font/local'

export const PPFramaText = localFont({
  variable: '--pp-frama-text',
  preload: true,
  src: [
    { path: './files/pp-frama-text-300-normal.woff2', weight: '100', style: 'normal' },
    { path: './files/pp-frama-text-300-italic.woff2', weight: '100', style: 'italic' },
    { path: './files/pp-frama-text-300-normal.woff2', weight: '200', style: 'normal' },
    { path: './files/pp-frama-text-300-italic.woff2', weight: '200', style: 'italic' },
    { path: './files/pp-frama-text-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './files/pp-frama-text-300-italic.woff2', weight: '300', style: 'italic' },
    { path: './files/pp-frama-text-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './files/pp-frama-text-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './files/pp-frama-text-400-normal.woff2', weight: '500', style: 'normal' },
    { path: './files/pp-frama-text-400-italic.woff2', weight: '500', style: 'italic' },
    { path: './files/pp-frama-text-400-normal.woff2', weight: '600', style: 'normal' },
    { path: './files/pp-frama-text-400-italic.woff2', weight: '600', style: 'italic' },
    { path: './files/pp-frama-text-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './files/pp-frama-text-700-italic.woff2', weight: '700', style: 'italic' },
    { path: './files/pp-frama-text-700-normal.woff2', weight: '800', style: 'normal' },
    { path: './files/pp-frama-text-700-italic.woff2', weight: '800', style: 'italic' },
    { path: './files/pp-frama-text-700-normal.woff2', weight: '900', style: 'normal' },
    { path: './files/pp-frama-text-700-italic.woff2', weight: '900', style: 'italic' },
  ],
  adjustFontFallback: 'Arial',
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

export default PPFramaText

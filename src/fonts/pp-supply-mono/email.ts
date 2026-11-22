// Served from `public/`, so email clients can load the files by absolute URL (see `EmailFonts`)
export default {
  family: 'PP Supply Mono',
  // email clients only accept these generic fallbacks (react-email's `FallbackFont`)
  fallback: ['monospace'],
  fonts: [
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-200.woff2',
      format: 'woff2',
      fontWeight: 100,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-200.woff2',
      format: 'woff2',
      fontWeight: 100,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-200.woff2',
      format: 'woff2',
      fontWeight: 200,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-200.woff2',
      format: 'woff2',
      fontWeight: 200,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-400.woff2',
      format: 'woff2',
      fontWeight: 300,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-400.woff2',
      format: 'woff2',
      fontWeight: 300,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-400.woff2',
      format: 'woff2',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-400.woff2',
      format: 'woff2',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-500.woff2',
      format: 'woff2',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-500.woff2',
      format: 'woff2',
      fontWeight: 500,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-500.woff2',
      format: 'woff2',
      fontWeight: 600,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-500.woff2',
      format: 'woff2',
      fontWeight: 600,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 800,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 800,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 900,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-supply-mono/pp-supply-mono-700.woff2',
      format: 'woff2',
      fontWeight: 900,
      fontStyle: 'italic',
    },
  ],
} as const

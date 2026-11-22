// Served from `public/`, so email clients can load the files by absolute URL (see `EmailFonts`)
export default {
  family: 'PP Frama Text',
  // email clients only accept these generic fallbacks (react-email's `FallbackFont`)
  fallback: ['Arial', 'sans-serif'],
  fonts: [
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-normal.woff2',
      format: 'woff2',
      fontWeight: 100,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-italic.woff2',
      format: 'woff2',
      fontWeight: 100,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-normal.woff2',
      format: 'woff2',
      fontWeight: 200,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-italic.woff2',
      format: 'woff2',
      fontWeight: 200,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-normal.woff2',
      format: 'woff2',
      fontWeight: 300,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-300-italic.woff2',
      format: 'woff2',
      fontWeight: 300,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-normal.woff2',
      format: 'woff2',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-italic.woff2',
      format: 'woff2',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-normal.woff2',
      format: 'woff2',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-italic.woff2',
      format: 'woff2',
      fontWeight: 500,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-normal.woff2',
      format: 'woff2',
      fontWeight: 600,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-400-italic.woff2',
      format: 'woff2',
      fontWeight: 600,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-normal.woff2',
      format: 'woff2',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-italic.woff2',
      format: 'woff2',
      fontWeight: 700,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-normal.woff2',
      format: 'woff2',
      fontWeight: 800,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-italic.woff2',
      format: 'woff2',
      fontWeight: 800,
      fontStyle: 'italic',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-normal.woff2',
      format: 'woff2',
      fontWeight: 900,
      fontStyle: 'normal',
    },
    {
      src: '/fonts/pp-frama-text/pp-frama-text-700-italic.woff2',
      format: 'woff2',
      fontWeight: 900,
      fontStyle: 'italic',
    },
  ],
} as const

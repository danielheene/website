/** @type {import('next-seo').DefaultSeoProps} */
module.exports = {
  titleTemplate: '%s | Daniel Heene',
  defaultTitle: 'Portfolio | Daniel Heene',

  noindex: process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production',
  nofollow: process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production',

  additionalMetaTags: [
    {
      property: 'viewport',
      content: 'initial-scale=1.0, width=device-width',
    },
    {
      name: 'msapplication-TileColor',
      content: '#5022F2',
    },
    {
      name: 'theme-color',
      content: '#FFFFFF',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],

  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.SITE_URL,
    site_name: 'Portfolio | Daniel Heene',
  },
};

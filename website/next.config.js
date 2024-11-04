const { withAxiom } = require('next-axiom');

/** @type {import('next').NextConfig} */
module.exports = withAxiom({
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  optimizeFonts: true,

  images: {
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
    domains: [
      'cdn.sanity.io',
      'api.sanity.io',
      'apicdn.sanity.io',
      'raw.githubusercontent.com',
      'source.unsplash.com',
      'images.unsplash.com',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\n/g, ''),
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/studio/:path*',
          destination:
            process.env.NODE_ENV === 'production'
              ? '/studio/index.html'
              : 'http://localhost:3333/studio/:path*',
        },
      ],
      fallback: [
        ...(process.env.NODE_ENV === 'production'
          ? [
              {
                source: '/:path*',
                destination: '/studio/:path*',
              },
            ]
          : [
              {
                source: '/:path*',
                destination: 'http://localhost:3333/:path*',
              },
            ]),
      ],
    };
  },

  // webpack: (config, { dev, isServer }) => {
  //   // Replace React with Preact only in client production build
  //   if (!dev && !isServer) {
  //     Object.assign(config.resolve.alias, {
  //       'react': 'preact/compat',
  //       'react-dom/test-utils': 'preact/test-utils',
  //       'react-dom': 'preact/compat',
  //     });
  //   }
  //
  //   return config;
  // },
});

// https://nextjs.org/docs/advanced-features/security-headers
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.twitter.com;
  child-src 'self' *.youtube.com *.google.com *.twitter.com;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src * blob: data:;
  media-src * blob: data:;
  connect-src *;
  font-src 'self' *.gstatic.com;
`;

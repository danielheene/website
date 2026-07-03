import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'

console.debug(JSON.stringify(process.env, null, 2 ))

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})


export default async (phase, { defaultConfig }) => {
  const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    serverExternalPackages: ['@react-pdf/renderer', 'svgo', 'pdf-parse'],
    turbopack: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.wasm', '.json', '.css', '.scss', '.svg'],
    },
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      remotePatterns: [
        new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/**`),
        new URL('https://daniel.heene.dev/**'),
        new URL('https://daniel.heene.review/**'),
        new URL('https://daniel.heene.io/**'),
        new URL('https://cdn.pixabay.com/**'),
      ],
      localPatterns: [{ pathname: '**' }],
      contentDispositionType: 'inline',
      contentSecurityPolicy: 'default-src \'self\'; script-src \'none\'; sandbox;',
      dangerouslyAllowSVG: true,
    },

    // webpack: (config, options) => {
    //   config.resolve.extensionAlias = {
    //     '.cjs': ['.cts', '.cjs'],
    //     '.js': ['.ts', '.tsx', '.js', '.jsx'],
    //     '.mjs': ['.mts', '.mjs'],
    //   }
    //
    //   config.plugins.push(new MiniCssExtractPlugin())
    //
    //   config.module.rules.push({
    //     test: /\.css$/i,
    //     use: [MiniCssExtractPlugin.loader, 'css-loader', '@tailwindcss/webpack'],
    //   },)
    //
    //   return config
    // },

    async rewrites() {
      const rewrites = []

      if (process.env['NEXT_PUBLIC_UMAMI_URL']) {
        rewrites.push({
          source: '/stats/:match*',
          destination: `${process.env['NEXT_PUBLIC_UMAMI_URL']}/:match*`,
        })
      }

      return rewrites
    },
  }

  return withBundleAnalyzer( withPayload(nextConfig, { devBundleServerPackages: false }))
}

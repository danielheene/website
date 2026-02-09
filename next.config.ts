import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'

/**
 * Next.js configuration for the Payload CMS integration.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env['UMAMI_WEBSITE_ID'] || undefined,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  sassOptions: {
    silenceDeprecations: ['import', 'legacy-js-api'],
    implementation: 'sass',
  },
  serverExternalPackages: ['@react-pdf/renderer', 'dompurify', 'svgo'],
  turbopack: {
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.wasm', '.json', '.css', '.scss', '.svg'],
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [new URL(`/api/media/**`, process.env.NEXT_PUBLIC_SERVER_URL)],
    localPatterns: [{ pathname: '**' }],
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    dangerouslyAllowSVG: true,
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },

  async rewrites() {
    const rewrites = []


    if (process.env['UMAMI_HOST_URL']) {
      rewrites.push({
        source: '/stats/:match*',
        destination: `${process.env['UMAMI_HOST_URL']}/:match*`,
      })
    }

    return rewrites
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

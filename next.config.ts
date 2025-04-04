import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'
import { RemotePattern } from 'next/dist/shared/lib/image-config'

const SERVER_URL =
  process.env['VERCEL_ENV'] === 'production'
    ? process.env['VERCEL_PROJECT_PRODUCTION_URL']
    : process.env['VERCEL_ENV'] === 'preview' || process.env['VERCEL_ENV'] === 'development'
      ? process.env['VERCEL_URL']
      : 'localhost:3000'
const SERVER_PROTOCOL = process.env['VERCEL_ENV'] ? 'https' : 'http'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\/toasty\/.(mp3|wav|aiff|m4a|aac)$/i,
      type: 'asset/resource',
      generator: {
        filename: () => 'static/media/[hash][ext][query]',
      },
    })

    return config
  },

  reactStrictMode: true,
  serverExternalPackages: ['@napi-rs/canvas', 'node-vibrant', 'dompurify', 'svgo'],
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    reactCompiler: false,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      !process.env['VERCEL_ENV'] ? { hostname: 'localhost', port: '3000' } : null,
      process.env['VERCEL_ENV'] ? { hostname: SERVER_URL, protocol: SERVER_PROTOCOL } : null,
      { hostname: 'daniel.heene.io', protocol: 'https' },
      { hostname: 'daniel.heene.dev', protocol: 'https' },
      { hostname: '*.vercel.app', protocol: 'https' },
    ].filter(Boolean) as RemotePattern[],
  },

  env: {
    NEXT_PUBLIC_SERVER_URL: `${SERVER_PROTOCOL}://${SERVER_URL}`,
    PAYLOAD_PUBLIC_SERVER_URL: `${SERVER_PROTOCOL}://${SERVER_URL}`,
  },
}

export default withPayload(nextConfig)

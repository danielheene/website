import { withPayload } from '@payloadcms/next/withPayload'
import { NextConfig } from 'next'
import { RemotePattern } from 'next/dist/shared/lib/image-config'

const SERVER_URL = String(
  process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.PAYLOAD_PUBLIC_SERVER_URL ??
    process.env.NEXT_PUBLIC_SERVER_URL ??
    process.env.SERVER_URL ??
    'http://localhost:3000',
)

const IS_DEV = String(
  process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development',
)

const IS_PROD = String(
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.PAYLOAD_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production',
)

const IS_CI = String(
  process.env.CI === 'true' ||
    process.env.VERCEL === 'true' ||
    process.env.CI === '1' ||
    process.env.VERCEL === '1',
)

export const IS_LOCAL_DEV = String(
  (!IS_PROD && !IS_CI && SERVER_URL.includes('localhost')) ||
    process.env.DATABASE_URI.includes('localhost'),
)

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\/toasty\/.(mp3|wav|aiff|m4a|aac)$/i,
      type: 'asset/resource',
      generator: {
        filename: () => 'static/media/[hash][ext][query]',
      },
      // loader: 'file-loader',
      // options: {
      //   outputPath: 'static',
      //   name: '[path][name].[ext]',
      // },
    })

    // Important: return the modified config
    return config
  },

  reactStrictMode: true,

  env: {
    SERVER_URL,
    IS_DEV,
    IS_PROD,
    IS_CI,
    IS_LOCAL_DEV,
  },

  // images: {
  //   dangerouslyAllowSVG: true,
  //   contentDispositionType: 'attachment',
  //   remotePatterns: [
  //     ...[SERVER_URL].map((item): RemotePattern => {
  //       const url = new URL(item)
  //
  //       return {
  //         hostname: url.hostname as RemotePattern['hostname'],
  //         protocol: url.protocol
  //           ? (url.protocol.replace(':', '') as RemotePattern['protocol'])
  //           : 'https',
  //       }
  //     }),
  //   ],
  // },
}

export default withPayload(nextConfig)

import { NextConfig } from 'next'

/**
 * A minimal Next.js config for the Storybook app.
 *
 * The Storybook renders the shared components from `packages/components`, not
 * the frontend's routes, so it needs none of the frontend's image domains,
 * remote patterns or dev-server wiring — pointing Storybook at
 * `apps/frontend/next.config.ts` would drag all of that in (including the
 * `spawn`ed dev server) and make the Storybook's own tsconfig resolution
 * ambiguous.
 *
 * What it does need is the same path aliases the stories use, which the
 * `paths` block below provides.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveExtensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '.cjs',
      '.mdx',
      '.wasm',
      '.json',
      '.css',
      '.scss',
      '.svg',
    ],
  },
}

export default nextConfig

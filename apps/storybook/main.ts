import { defineMain } from '@storybook/nextjs-vite/node'
import tailwindPostcss from '@tailwindcss/postcss'

export default defineMain({
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      // The Storybook's own Next config — it only needs the path aliases the
      // stories use, not the frontend's routes, image domains or dev server.
      nextConfigPath: './next.config.ts',
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'storybook.heene.io',
      'storybook.heene.dev',
      'storybook.heene.review',
      'storybook.heene.nexus',
    ],
  },
  stories: [
    {
      directory: './foundations',
      titlePrefix: 'Foundations',
      files: '*.mdx',
    },
    {
      directory: './components',
      titlePrefix: 'UI Components',
      files: '*.stories.tsx',
    },
    {
      directory: './shaders',
      titlePrefix: 'Shaders',
      files: '*.@(mdx|tsx)',
    },
  ],
  // The frontend's public assets (favicons, og-image) are the same ones the
  // site serves, so Storybook shows the real thing.
  staticDirs: ['../frontend/public'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  typescript: {
    // react-docgen-typescript needs the TypeScript JS API (`ts.sys`), which
    // TypeScript 7 no longer ships; react-docgen parses with Babel instead.
    reactDocgen: 'react-docgen',
  },
  async viteFinal(config) {
    const existingOnwarn = config.build?.rollupOptions?.onwarn

    return {
      ...config,
      css: {
        ...config.css,
        // Vite only runs PostCSS when a config is discoverable from the CSS
        // file's directory; pointing it at the plugin explicitly keeps the
        // Tailwind v4 transform applied to every stylesheet the Storybook
        // pulls in, wherever it lives.
        postcss: {
          plugins: [tailwindPostcss()],
        },
      },
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          // "use client" has no meaning once bundled for the browser here —
          // Storybook only needs the component, not the RSC boundary marker
          // Next.js would otherwise read it for. Rollup's own warning about
          // it is accurate but not actionable in this context, so it's
          // filtered out rather than left as noise on every build.
          onwarn(warning, warn) {
            if (
              warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
              warning.message.includes('"use client"')
            ) {
              return
            }

            if (existingOnwarn) {
              existingOnwarn(warning, warn)
            } else {
              warn(warning)
            }
          },
        },
      },
    }
  },
})

import { defineMain } from '@storybook/nextjs-vite/node'

export default defineMain({
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: '../next.config.ts',
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
  staticDirs: [
    '../public',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: './tsconfig.json',
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => !!prop.parent?.fileName?.includes('node_modules'),
    },
  },
  async viteFinal(config) {
    const existingOnwarn = config.build?.rollupOptions?.onwarn

    return {
      ...config,
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

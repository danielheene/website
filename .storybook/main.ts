import { defineMain } from '@storybook/nextjs-vite/node'

export default defineMain({
  framework: {
    name: '@storybook/nextjs-vite',
    options: {
      nextConfigPath: '..',
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
  staticDirs: ['../public'],
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
    return {
      ...config,
      build: {
        ...config.build,
        rolldownOptions: {
          onLog: (level, log, defaultHandler) => {
            if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('"use client"')) {
              return
            }

            defaultHandler(level, log)
          },
          output: {
            codeSplitting: {
              groups: [
                {
                  name: 'react-vendor',
                  test: /node_modules[\\/]react/,
                  priority: 20,
                },
                {
                  name: 'storybook-vendor',
                  test: /node_modules[\\/]@storybook/,
                  priority: 15,
                },

                {
                  name: 'radix-vendor',
                  test: /node_modules[\\/]@radix-ui/,
                  priority: 15,
                },

                {
                  name: 'vendor',
                  test: /node_modules/,
                  priority: 10,
                },
                {
                  name: 'common',
                  minShareCount: 2,
                  minSize: 10000,
                  priority: 5,
                },
              ],
            },
          },
        },
      },
    }
  },
})

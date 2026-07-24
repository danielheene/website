import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineMain } from '@storybook/nextjs/node'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'

const dirName = dirname(fileURLToPath(import.meta.url))

export default defineMain({
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.ts',
      builder: {
        useSWC: true,
      },
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: [
    '../public',
    {
      from: '../src/fonts/pp-frama/files',
      to: '/src/fonts/pp-frama/files',
    },
    {
      from: '../src/fonts/pp-frama-text/files',
      to: '/src/fonts/pp-frama-text/files',
    },
    {
      from: '../src/fonts/pp-supply-sans/files',
      to: '/src/fonts/pp-supply-sans/files',
    },
    {
      from: '../src/fonts/pp-supply-mono/files',
      to: '/src/fonts/pp-supply-mono/files',
    },
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => !!prop.parent?.fileName?.includes('node_modules'),
    },
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.plugins = [
      ...(config.resolve.plugins ?? []),
      new TsconfigPathsPlugin({
        configFile: resolve(dirName, '../tsconfig.json'),
      }),
    ]

    return config
  },
})

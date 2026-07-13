import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { defineMain } from '@storybook/nextjs/node'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const dirName = dirname(fileURLToPath(import.meta.url))

export default defineMain({
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      nextConfigPath: '../../web/next.config.ts',
    },

  },
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  staticDirs: ['../../web/public'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
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



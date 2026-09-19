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
    '@storybook/addon-themes',
    '@storybook/addon-mcp',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => !!prop.parent?.fileName?.includes('node_modules'),
    },
  },
})

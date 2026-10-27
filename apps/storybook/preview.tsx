import '@website/font-pp-frama/css'
import '@website/font-pp-frama-text/css'
import '@website/font-pp-supply-mono/css'
import '@website/font-pp-supply-sans/css'
import '@website/storybook/storybook.css'
import addonA11y from '@storybook/addon-a11y'
import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import { DocsTypes } from '@storybook/addon-docs'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { withThemeByClassName } from '@storybook/addon-themes'
import * as addonThemesPreview from '@storybook/addon-themes/preview'
import { definePreview } from '@storybook/nextjs-vite'

export default definePreview({
  addons: [addonA11yPreview, addonDocsPreview, addonThemesPreview, addonA11y()],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    react: {
      rsc: true,
    },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      exclude: ['className', 'children'],
    },
    docs: {} as DocsTypes['parameters']['docs'],
  },
  tags: ['autodocs'],
  decorators: [
    withThemeByClassName({
      defaultTheme: 'light',
      themes: {
        light: 'light',
        dark: 'dark',
        primary: 'primary',
      },
    }),
  ],
})

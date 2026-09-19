import '@/fonts/pp-frama/style.css'
import '@/fonts/pp-frama-text/style.css'
import '@/fonts/pp-supply-mono/style.css'
import '@/fonts/pp-supply-sans/style.css'
import '@/styles/frontend.css'

import addonA11y from '@storybook/addon-a11y'
import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import { DocsTypes } from '@storybook/addon-docs'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { withThemeByClassName } from '@storybook/addon-themes'
import * as addonThemesPreview from '@storybook/addon-themes/preview'
import { definePreview } from '@storybook/nextjs-vite'

export default definePreview({
  addons: [
    addonA11yPreview,
    addonDocsPreview,
    addonThemesPreview,
    addonA11y(),
  ],
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
      exclude: [
        'className',
        'children',
      ],
    },
    docs: {} as DocsTypes['parameters']['docs'],
  },
  tags: [
    'autodocs',
  ],
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

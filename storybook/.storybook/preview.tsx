import '@/styles/frontend.css'
import { PPFrama } from '@danielheene/font-pp-frama/next'

import { definePreview } from '@storybook/nextjs'
import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { cn } from '@sb/lib/cn'

export default definePreview({
  addons: [
    addonA11yPreview,
    addonDocsPreview,
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      }, parentSelector: 'html',
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story) => (
      <div className={cn(PPFrama.variable)}>
        <Story />
      </div>
    ),
  ],
})

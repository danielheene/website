import '@/styles/frontend.css'
import '@/fonts/pp-frama/style.css'
import '@/fonts/pp-frama-text/style.css'
import '@/fonts/pp-supply-mono/style.css'
import '@/fonts/pp-supply-sans/style.css'

import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { definePreview } from '@storybook/nextjs'

export default definePreview({
  addons: [
    addonA11yPreview,
    addonDocsPreview,
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
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
    docs: {},
  },
  tags: [
    'autodocs',
  ],
  decorators: [
    /**
     * Paints the story surface with the same semantic tokens the app uses, so a
     * story toggled to dark sits on `--background` instead of Storybook's
     * default white canvas.
     */
    (Story) => (
      <div className="bg-background text-foreground p-8">
        <Story />
      </div>
    ),
    withThemeByDataAttribute({
      defaultTheme: 'light',
      themes: {
        light: 'light',
        dark: 'dark',
      },
      attributeName: 'data-theme',
    }),
  ],
})

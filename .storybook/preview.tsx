import addonA11y from '@storybook/addon-a11y'
import '@/styles/frontend.css'
import '@/fonts/pp-frama/style.css'
import '@/fonts/pp-frama-text/style.css'
import '@/fonts/pp-supply-mono/style.css'
import '@/fonts/pp-supply-sans/style.css'

import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import { DocsTypes } from '@storybook/addon-docs'
import { DocsContainer, Story } from '@storybook/addon-docs/blocks'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { withThemeByClassName } from '@storybook/addon-themes'
import * as addonThemesPreview from '@storybook/addon-themes/preview'
import { definePreview } from '@storybook/nextjs-vite'
import { cn } from 'tailwind-variants'

import PPFrama from '@/fonts/pp-frama/next'
import PPFramaText from '@/fonts/pp-frama-text/next'
import PPSupplyMono from '@/fonts/pp-supply-mono/next'
import PPSupplySans from '@/fonts/pp-supply-sans/next'

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
    docs: {
      container: (props) => (
        <div
          className={cn([
            PPFrama.variable,
            PPFramaText.variable,
            PPSupplySans.variable,
            PPSupplyMono.variable,
          ])}
        >
          <DocsContainer {...props} />
        </div>
      ),
    } as DocsTypes['parameters']['docs'],
  },
  tags: [
    'autodocs',
  ],

  decorators: [
    (Story) => (
      <div
        className={cn([
          PPFrama.variable,
          PPFramaText.variable,
          PPSupplySans.variable,
          PPSupplyMono.variable,
        ])}
      >
        <Story />
      </div>
    ),
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

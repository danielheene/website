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

import { TooltipProvider } from '@/components/AdminPanel/TooltipProvider'
import { DuoTone } from '@/components/DuoTone'

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
  globalTypes: {
    duoTone: {
      description: 'Shows shaders under the brand duotone, as the hero renders them',
      toolbar: {
        title: 'DuoTone',
        icon: 'contrast',
        items: [
          { value: 'off', title: 'DuoTone off' },
          { value: 'on', title: 'DuoTone on' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    duoTone: 'off',
  },
  decorators: [
    (Story, { globals, title }) =>
      globals.duoTone === 'on' && title.startsWith('Shaders/') ? (
        <DuoTone contained>
          <Story />
        </DuoTone>
      ) : (
        <Story />
      ),
    // `Tooltip` renders no Provider of its own; the app mounts one globally
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
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

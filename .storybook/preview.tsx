import '@/fonts/pp-frama/style.css'
import '@/fonts/pp-frama-text/style.css'
import '@/fonts/pp-supply-mono/style.css'
import '@/fonts/pp-supply-sans/style.css'
import '@/styles/frontend.css'
import addonA11y from '@storybook/addon-a11y'
import * as addonA11yPreview from '@storybook/addon-a11y/preview'
import { DocsTypes } from '@storybook/addon-docs'
import * as addonDocsPreview from '@storybook/addon-docs/preview'
import { definePreview } from '@storybook/nextjs-vite'

import { TooltipProvider } from '@/components/AdminPanel/TooltipProvider'
import { DuoTone } from '@/components/DuoTone'

import { LightDocsContainer } from './LightDocsContainer'
import { StoryCanvasTheme } from './StoryCanvasTheme'
import { applyDarkMode, DARK_MODE_GLOBAL, DUO_TONE_GLOBAL } from './toolbarGlobals'

export default definePreview({
  addons: [addonA11yPreview, addonDocsPreview, addonA11y()],
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
    docs: {
      container: LightDocsContainer,
    } as DocsTypes['parameters']['docs'],
  },
  tags: ['autodocs'],
  // toggled by the toolbar buttons in manager.tsx
  initialGlobals: {
    [DARK_MODE_GLOBAL]: false,
    [DUO_TONE_GLOBAL]: false,
  },
  decorators: [
    (Story, { globals }) =>
      globals[DUO_TONE_GLOBAL] === true ? (
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
    (Story, { globals, viewMode }) => {
      const isDark = globals[DARK_MODE_GLOBAL] === true

      // a docs page themes each story's canvas, not the page around it
      if (viewMode === 'docs') {
        applyDarkMode(false)

        return (
          <StoryCanvasTheme isDark={isDark}>
            <Story />
          </StoryCanvasTheme>
        )
      }

      applyDarkMode(isDark)

      return <Story />
    },
  ],
})

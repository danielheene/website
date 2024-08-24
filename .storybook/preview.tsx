import type { Preview } from '@storybook/react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

import '../src/styles/frontend.css'

const preview: Preview = {
  decorators: [],

  parameters: {
    nextjs: {
      appDirectory: true,
    },

    layout: 'centered',

    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: null,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      exclude: ['className', 'children'],
    },
  },

  tags: ['autodocs'],
}

export default preview

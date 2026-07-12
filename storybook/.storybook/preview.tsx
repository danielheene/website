import '../src/styles.css'

import { definePreview } from '@storybook/nextjs'


export default definePreview({
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
  addons: [],

})

import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ThemeSwitch } from '@/components/ThemeSwitch'

const meta = {
  title: 'ThemeSwitch',
  component: ThemeSwitch,
  args: {
    theme: 'light',
  },
  argTypes: {
    theme: {
      control: {
        type: 'select',
      },
      options: ['light', 'system', 'dark'],
    },
    setTheme: {
      control: false,
    },
  },
} satisfies Meta<typeof ThemeSwitch>

export default meta

type Story = StoryObj<typeof meta>

/**
 * `setTheme` is a no-op here so the icon reflects the `theme` control
 * directly instead of internal state.
 */
export const Light: Story = {
  args: {
    theme: 'light',
    setTheme: () => {},
  },
}

export const Dark: Story = {
  args: {
    theme: 'dark',
    setTheme: () => {},
  },
}

/** Wires `theme`/`setTheme` to component state so the button toggles for real when clicked. */
export const Interactive: Story = {
  args: {
    theme: 'light',
    setTheme: () => {},
  },
  argTypes: {
    theme: {
      control: false,
    },
  },
  render: () => {
    const [theme, setTheme] = useState('system')
    return <ThemeSwitch theme={theme} setTheme={setTheme} />
  },
}

import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs'

import { ThemeToggleIconButton } from './ThemeToggleIIconButton'

const meta = {
  title: 'Components/ThemeToggleIconButton',
  component: ThemeToggleIconButton,
  args: {
    theme: 'light',
  },
  argTypes: {
    theme: {
      control: {
        type: 'select',
      },
      options: [
        'light',
        'dark',
      ],
    },
    setTheme: {
      control: false,
    },
  },
} satisfies Meta<typeof ThemeToggleIconButton>

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
    const [theme, setTheme] = useState('light')
    return <ThemeToggleIconButton theme={theme} setTheme={setTheme} />
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Logo, LogoColor, LogoVariant } from '@/components/Logo/Logo'

const meta = {
  title: 'Logo',
  component: Logo,
  args: {
    variant: LogoVariant.Inline,
    color: LogoColor.Primary,
    blink: false,
  },
} satisfies Meta<typeof Logo>

export default meta

type Story = StoryObj<typeof Logo>

export const Inline: Story = {
  args: {
    variant: LogoVariant.Inline,
  },
}

export const Initials: Story = {
  args: {
    variant: LogoVariant.Initials,
  },
}

export const Square: Story = {
  args: {
    variant: LogoVariant.Square,
  },
}

export const Wrapped: Story = {
  args: {
    variant: LogoVariant.Wrapped,
  },
}

export const Animated: Story = {
  args: {
    blink: true,
  },
}

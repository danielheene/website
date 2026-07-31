import type { Meta } from '@storybook/nextjs'
import { StoryObj } from '@storybook/nextjs'

import { Logo, LogoColor, LogoVariant } from './Logo'

const meta = {
  title: 'Components/Logo',
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

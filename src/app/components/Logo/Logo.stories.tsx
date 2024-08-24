import type { Meta } from '@storybook/react'
import { StoryObj } from '@storybook/react'

import { Logo } from './Logo'
import { LOGO_COLOR, LOGO_SIZE, LOGO_VARIANT } from './Logo.data'

const meta = {
  title: 'Components/Logo',
  component: Logo,
  args: {
    variant: LOGO_VARIANT.SINGLELINE,
    color: LOGO_COLOR.BRAND,
    size: LOGO_SIZE.REGULAR,
    animated: false,
  },
} satisfies Meta<typeof Logo>

export default meta

type Story = StoryObj<typeof Logo>

export const SingleLine: Story = {
  args: {
    variant: LOGO_VARIANT.SINGLELINE,
  },
}

export const MultiLine: Story = {
  args: {
    variant: LOGO_VARIANT.MULTILINE,
  },
}

export const Animated: Story = {
  args: {
    animated: true,
  },
}

import type { Meta } from '@storybook/react'
import { StoryObj } from '@storybook/react'

import { Banner, BANNER_VARIANT } from './Banner'

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    children: 'Sit esse deserunt anim incididunt fugiat exercitation adipisicing ullamco amet.',
    variant: BANNER_VARIANT.INFO,
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.values(BANNER_VARIANT),
        defaultValue: BANNER_VARIANT.INFO,
      },
    },
  }
} satisfies Meta<typeof Banner>

export default meta

type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    variant: BANNER_VARIANT.INFO,
  },
}

export const Error: Story = {
  args: {
    variant: BANNER_VARIANT.ERROR,
  },
}

export const Warning: Story = {
  args: {
    variant: BANNER_VARIANT.WARNING,
  },
}

export const Success: Story = {
  args: {
    variant: BANNER_VARIANT.SUCCESS,
  },
}

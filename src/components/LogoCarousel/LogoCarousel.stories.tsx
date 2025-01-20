import type { Meta } from '@storybook/react'
import { StoryObj } from '@storybook/react'

import { LogoCarousel } from './LogoCarousel'
import { mockData } from './LogoCarousel.mock'

const meta = {
  title: 'Components/LogoCarousel',
  component: LogoCarousel,
  args: mockData,
  argTypes: {
    entries: {
      control: {
        readonly: true,
      },
    },
  },
} satisfies Meta<typeof LogoCarousel>

export default meta

type Story = StoryObj<typeof LogoCarousel>

export const Info: Story = {
  args: {},
}

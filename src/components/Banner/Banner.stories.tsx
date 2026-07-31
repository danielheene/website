import { Meta, StoryObj } from '@storybook/nextjs'

import { Banner, BannerVariant } from './Banner'

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    children: 'Sit esse deserunt anim incididunt fugiat exercitation adipisicing ullamco amet.',
    variant: BannerVariant.Info,
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.values(BannerVariant),
        defaultValue: BannerVariant.Info,
      },
    },
  },
} satisfies Meta<typeof Banner>

export default meta

type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    variant: BannerVariant.Info,
  },
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: <Name of Story>
export const Error: Story = {
  args: {
    variant: BannerVariant.Error,
  },
}

export const Warning: Story = {
  args: {
    variant: BannerVariant.Warning,
  },
}

export const Success: Story = {
  args: {
    variant: BannerVariant.Success,
  },
}

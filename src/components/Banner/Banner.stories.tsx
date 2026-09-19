import { Meta, StoryObj } from '@storybook/nextjs'

import { Banner, BannerVariant } from './Banner'

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    children: 'Sit esse deserunt anim incididunt fugiat exercitation adipisicing ullamco amet.',
    variant: BannerVariant.Neutral,
    inverse: false,
    customIcon: '',
    rotateIcon: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(BannerVariant),
      table: {
        defaultValue: {
          summary: BannerVariant.Neutral,
        },
      },
    },
    inverse: {
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    customIcon: {
      control: {
        type: 'text',
      },
    },
    rotateIcon: {
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
} satisfies Meta<typeof Banner>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    variant: BannerVariant.Neutral,
  },
}

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

/** White background, colored text/icon instead of a solid color fill. */
export const Inverse: Story = {
  args: {
    variant: BannerVariant.Info,
    inverse: true,
  },
}

/** Overrides the variant's default icon with an arbitrary Iconify name. */
export const CustomIcon: Story = {
  args: {
    variant: BannerVariant.Success,
    customIcon: 'material-symbols:rocket-launch',
  },
}

/** Spins the icon continuously — useful for an in-progress/loading state. */
export const RotateIcon: Story = {
  args: {
    variant: BannerVariant.Info,
    customIcon: 'material-symbols:progress-activity',
    rotateIcon: true,
  },
}

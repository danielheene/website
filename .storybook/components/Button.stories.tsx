import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button, buttonStyles } from '@/components/Button/Button'

const meta = {
  title: 'Button',
  component: Button,
  args: {
    size: 'lg',
    variant: 'default',
    type: 'button',
    children: 'Button',
  },
  argTypes: {
    size: {
      control: 'select',
      options: Object.keys(buttonStyles.variants.size),
      table: {
        defaultValue: {
          summary: 'default',
        },
      },
    },
    variant: {
      control: 'select',
      options: Object.keys(buttonStyles.variants.variant),
      table: {
        defaultValue: {
          summary: 'default',
        },
      },
    },
    type: {
      control: {
        type: 'select',
        options: [
          'button',
          'submit',
          'reset',
        ],
        defaultValue: 'button',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Variant/Default',
  args: {
    variant: 'default',
    size: 'default',
  },
}

export const Secondary: Story = {
  name: 'Variant/Secondary',
  args: {
    variant: 'secondary',
  },
}

export const Outline: Story = {
  name: 'Variant/Outline',
  args: {
    variant: 'outline',
  },
}

export const Ghost: Story = {
  name: 'Variant/Ghost',
  args: {
    variant: 'ghost',
  },
}

export const Destructive: Story = {
  name: 'Variant/Destructive',
  args: {
    variant: 'destructive',
  },
}

export const Link: Story = {
  name: 'Variant/Link',
  args: {
    variant: 'link',
  },
}

export const WithStartAndEndIcon: Story = {
  name: 'Icons/startIcon + endIcon',
  args: {
    startIcon: 'material-symbols:download',
    endIcon: 'material-symbols:check-circle',
    children: 'Download',
  },
}

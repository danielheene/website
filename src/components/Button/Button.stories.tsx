import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button, buttonStyles } from './Button'

const meta = {
  title: 'Components/Button',
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
          'link',
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

/**
 * `asChild` merges the button's classes onto the caller's own element (here
 * a plain `<a>` standing in for `next/link`'s `Link`) instead of rendering
 * a `<button>` — Radix's `Slot` under the hood. `startIcon`/`endIcon` still
 * work in this mode: they render as ordinary siblings next to the slotted
 * element, which is wrapped in `Slottable` internally so `Slot` can tell it
 * apart from the icons. Inspect the DOM: there is exactly one `<a>`,
 * carrying the button's classes, with two real `<svg>` siblings — nothing
 * is dropped, nothing is double-wrapped.
 *
 * See `Patterns/Radix Slot` for how `Slot`/`Slottable` work in isolation.
 */
export const AsChildWithIcons: Story = {
  name: 'Icons/asChild + startIcon + endIcon',
  argTypes: {
    children: {
      control: false,
    },
  },
  args: {
    asChild: true,
    startIcon: 'material-symbols:download',
    endIcon: 'material-symbols:check-circle',
  },
  render: (args) => (
    <Button {...args}>
      <a href="/resume.pdf">Download wwwwwww</a>
    </Button>
  ),
}

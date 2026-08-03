import { Fragment } from 'react'

import type { Meta, StoryObj } from '@storybook/nextjs'

import { Separator } from '../Separator'

import { Badge, BadgeProps, badgeStyles } from './Badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    color: badgeStyles.defaultVariants.color,
    style: badgeStyles.defaultVariants.style,
    size: badgeStyles.defaultVariants.size,
    children: 'Badge',
  },
  argTypes: {
    color: {
      control: {
        type: 'select',
      },
      options: Object.keys(badgeStyles.variants.color),
      table: {
        defaultValue: {
          summary: 'neutral',
        },
      },
    },
    style: {
      control: {
        type: 'select',
      },
      options: Object.keys(badgeStyles.variants.style),
      table: {
        defaultValue: {
          summary: 'outline',
        },
      },
    },
    size: {
      control: {
        type: 'select',
      },
      options: Object.keys(badgeStyles.variants.size),
      table: {
        defaultValue: {
          summary: 'md',
        },
      },
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default',
}

export const AllOptions: Story = {
  argTypes: {
    color: {
      control: false,
    },
    style: {
      control: false,
    },
    size: {
      control: false,
    },
  },

  render: () => (
    <div className="flex flex-col gap-4 shrink-0 grow-0">
      {Object.keys(badgeStyles.variants.size).map((size: BadgeProps['size']) => (
        <Fragment key={size}>
          <h3 className="font-mono font-bold">{size.toUpperCase()}:</h3>
          <div key={size} className="flex flex-row gap-2 shrink-0 grow-0">
            {Object.keys(badgeStyles.variants.color).map((color: BadgeProps['color']) => (
              <div key={color} className="flex flex-col items-center gap-2 shrink-0 grow-0">
                {Object.keys(badgeStyles.variants.style).map((style: BadgeProps['style']) => (
                  <Badge key={style} color={color} size={size} style={style}>
                    Label
                  </Badge>
                ))}
              </div>
            ))}
          </div>
          <Separator />
        </Fragment>
      ))}
    </div>
  ),
}

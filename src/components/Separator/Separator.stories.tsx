import type { Meta, StoryObj } from '@storybook/nextjs'

import { Separator } from './Separator'

const meta = {
  title: 'Components/Separator',
  component: Separator,
  args: {
    orientation: 'horizontal',
    decorative: true,
  },
  argTypes: {
    orientation: {
      control: {
        type: 'select',
      },
      options: [
        'horizontal',
        'vertical',
      ],
      table: {
        defaultValue: {
          summary: 'horizontal',
        },
      },
    },
    decorative: {
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => (
    <div className="w-64">
      <Separator {...args} />
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-16 items-center gap-4">
      <span>Left</span>
      <Separator {...args} />
      <span>Right</span>
    </div>
  ),
}

/** Typical usage: separating stacked text blocks. */
export const BetweenContent: Story = {
  render: () => (
    <div className="w-80">
      <div className="space-y-1">
        <h4 className="font-medium">Section title</h4>
        <p className="text-muted-foreground text-sm">A short description of the section.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>One</span>
        <Separator orientation="vertical" />
        <span>Two</span>
        <Separator orientation="vertical" />
        <span>Three</span>
      </div>
    </div>
  ),
}

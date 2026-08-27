import type { Meta, StoryObj } from '@storybook/nextjs'

import { Skeleton } from './Skeleton'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    noPulse: false,
    className: 'w-48 h-4',
  },
  argTypes: {
    noPulse: {
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
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoPulse: Story = {
  args: {
    noPulse: true,
  },
}

/** A typical loading placeholder for a card: avatar, title, and two text lines. */
export const CardPlaceholder: Story = {
  argTypes: {
    className: {
      control: false,
    },
    noPulse: {
      control: false,
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  ),
}

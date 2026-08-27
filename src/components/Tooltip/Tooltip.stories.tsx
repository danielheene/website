import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button } from '../Button'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: 'Helpful hint',
    side: 'top',
    align: 'center',
    defaultOpen: true,
  },
  argTypes: {
    content: {
      control: {
        type: 'text',
      },
    },
    side: {
      control: {
        type: 'select',
      },
      options: [
        'top',
        'right',
        'bottom',
        'left',
      ],
      table: {
        defaultValue: {
          summary: 'top',
        },
      },
    },
    align: {
      control: {
        type: 'select',
      },
      options: [
        'start',
        'center',
        'end',
      ],
      table: {
        defaultValue: {
          summary: 'center',
        },
      },
    },
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="outline">Hover me</Button>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

/** `defaultOpen` keeps the tooltip visible in the canvas without hovering. */
export const Default: Story = {}

export const Top: Story = {
  args: {
    side: 'top',
  },
}

export const Right: Story = {
  args: {
    side: 'right',
  },
}

export const Bottom: Story = {
  args: {
    side: 'bottom',
  },
}

export const Left: Story = {
  args: {
    side: 'left',
  },
}

/** Omit `defaultOpen` to interact with the trigger the way a user would. */
export const Interactive: Story = {
  args: {
    defaultOpen: false,
  },
}

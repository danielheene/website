import type { Meta, StoryObj } from '@storybook/nextjs'

import { Switch } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    checked: false,
  },
  argTypes: {
    checked: {
      control: {
        type: 'boolean',
      },
    },
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  args: {
    checked: false,
  },
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

/**
 * Uncontrolled: `checked`/`onCheckedChange` are omitted so the component falls
 * back to its internal state and can be toggled directly in the canvas.
 */
export const Interactive: Story = {
  args: {
    checked: undefined,
  },
}

/** Both states side by side, to verify the thumb and track in either theme. */
export const BothStates: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch checked={false} />
      <Switch checked={true} />
    </div>
  ),
}

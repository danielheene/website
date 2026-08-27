import type { Meta, StoryObj } from '@storybook/nextjs'

import { Headline } from './Headline'

const meta = {
  title: 'Components/Headline',
  component: Headline,
  args: {
    variant: 'default',
    children: 'The quick brown fox jumps over the lazy dog',
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      options: [
        'default',
        'page-title',
        'section',
        'subline',
      ],
      table: {
        defaultValue: {
          summary: 'default',
        },
      },
    },
    as: {
      control: {
        type: 'select',
      },
      options: [
        undefined,
        'h2',
        'h3',
        'h4',
      ],
    },
  },
} satisfies Meta<typeof Headline>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PageTitle: Story = {
  args: {
    variant: 'page-title',
  },
}

export const Section: Story = {
  args: {
    variant: 'section',
  },
}

export const Subline: Story = {
  args: {
    variant: 'subline',
  },
}

/**
 * `variant` controls the visual size while `as` controls the rendered tag —
 * useful for keeping heading order correct without changing the look.
 */
export const CustomTag: Story = {
  args: {
    variant: 'page-title',
    as: 'h2',
  },
}

/** All variants stacked, to compare scale and spacing at a glance. */
export const AllVariants: Story = {
  argTypes: {
    variant: {
      control: false,
    },
    as: {
      control: false,
    },
    children: {
      control: false,
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Headline variant="page-title">Page Title</Headline>
      <Headline variant="section">Section</Headline>
      <Headline variant="subline">Subline</Headline>
      <Headline variant="default">Default</Headline>
    </div>
  ),
}

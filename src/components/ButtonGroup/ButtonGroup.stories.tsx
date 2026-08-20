import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button } from '../Button'
import { Icon } from '../Icon'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './ButtonGroup'

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  args: {
    orientation: 'horizontal',
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
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">One</Button>
      <Button variant="outline">Two</Button>
      <Button variant="outline">Three</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
}

/** Icon-only actions grouped together. */
export const IconButtons: Story = {
  argTypes: {
    orientation: {
      control: false,
    },
  },
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Bold">
        <Icon name="material-symbols:format-bold" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Italic">
        <Icon name="material-symbols:format-italic" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Underline">
        <Icon name="material-symbols:format-underlined" />
      </Button>
    </ButtonGroup>
  ),
}

/** `ButtonGroupText` and `ButtonGroupSeparator` combine with buttons to build compound controls. */
export const WithTextAndSeparator: Story = {
  argTypes: {
    orientation: {
      control: false,
    },
  },
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>https://</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline">Copy</Button>
    </ButtonGroup>
  ),
}

/** Grouping multiple `ButtonGroup`s adds spacing between clusters instead of merging their edges. */
export const NestedGroups: Story = {
  argTypes: {
    orientation: {
      control: false,
    },
  },
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Undo">
          <Icon name="lucide:undo-2" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Redo">
          <Icon name="lucide:redo-2" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Save</Button>
        <Button variant="outline">Publish</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
}

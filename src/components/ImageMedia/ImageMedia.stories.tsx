import type { Meta } from '@storybook/react'
import { StoryObj } from '@storybook/react'

import { ImageMedia, ImageMediaProps } from './ImageMedia'

// type ImageSource = { url: string; width: number; height: number; brightness: number }

const IMAGE_EXAMPLES: Record<string, ImageMediaProps> = {
  'Image 1': {
    url: 'https://images.unsplash.com/photo-1517373116369-9bdb8cdc9f62',
    width: 1385,
    height: 923,
    brightness: 12,
    alt: '',
  },
  'Image 2': {
    url: 'w',
    width: 1385,
    height: 949,
    alt: '',
  },
  'Image 3': {
    url: 'https://images.unsplash.com/photo-1603969072881-b0fc7f3d77d7',
    width: 1385,
    height: 923,
    alt: '',
  },
  'Image 4': {
    url: 'https://images.unsplash.com/photo-1728231465732-427fc9a71f29',
    width: 1385,
    height: 923,
    alt: '',
  },
  'Image 5': {
    url: 'https://images.unsplash.com/photo-1557819816-b9bf92c11467',
    width: 1385,
    height: 1038,
    alt: '',
  },
}

const meta = {
  title: 'Components/ImageMedia',
  component: ImageMedia,
  args: {
    duoTone: false,
    url: Object.values(IMAGE_EXAMPLES)[0]['url'],
  },
  argTypes: {
    url: {
      control: 'select',
      options: Object.keys(IMAGE_EXAMPLES),
      mapping: IMAGE_EXAMPLES,
    },
  },
} satisfies Meta<typeof ImageMedia>

export default meta

type Story = StoryObj<typeof ImageMedia>

export const Info: Story = {
  args: {},
}

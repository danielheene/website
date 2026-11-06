import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DarkVeil, presets } from '@/components/Shaders/DarkVeil'

const meta = {
  title: 'DarkVeil',
  component: DarkVeil,
  parameters: {
    layout: 'padded',
  },
  args: {
    color: '#ffffff',
    speed: 0.5,
    scale: 1,
    rotation: 0,
    flow: 1,
    warp: 0,
    variation: 0,
    brightness: 1,
    sheen: 0.5,
    glow: 0.4,
    grain: 0.2,
    quality: 1,
    mouseInteraction: true,
    mouseStrength: 1,
    intro: true,
    fade: 0,
    opacity: 1,
    lightMode: false,
  },
  argTypes: {
    color: {
      control: 'color',
      description: 'Primary tint color for the neural CPPN wave structures.',
    },
    speed: {
      control: { type: 'range', min: 0, max: 2, step: 0.05 },
      description: 'Time progression rate through latent neural space.',
    },
    scale: {
      control: { type: 'range', min: 0.2, max: 3, step: 0.05 },
      description: 'Pattern spatial zoom scale.',
    },
    rotation: {
      control: { type: 'range', min: 0, max: 360, step: 5 },
      description: 'Orientation angle in degrees.',
    },
    flow: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      description: 'Neural flow evolution speed.',
    },
    warp: {
      control: { type: 'range', min: 0, max: 2, step: 0.05 },
      description: 'Domain distortion and harmonic warping intensity.',
    },
    variation: {
      control: { type: 'range', min: 0, max: 10, step: 1 },
      description: 'Latent space seed variation index.',
    },
    brightness: {
      control: { type: 'range', min: 0.2, max: 2, step: 0.05 },
      description: 'Luminance gain multiplier.',
    },
    sheen: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Specular silk highlight reflectance.',
    },
    glow: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Outer bloom glow intensity.',
    },
    grain: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Film grain texture noise overlay.',
    },
    mouseInteraction: {
      control: 'boolean',
      description: 'Enable magnetic distortion follow on pointer hover.',
    },
    lightMode: {
      control: 'boolean',
      description: 'Invert luminance mapping for bright background themes.',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DarkVeil>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ...presets.default,
  },
}

export const Ember: Story = {
  args: {
    ...presets.ember,
  },
}

export const Jade: Story = {
  args: {
    ...presets.jade,
  },
}

export const Silver: Story = {
  args: {
    ...presets.silver,
  },
}

export const Storm: Story = {
  args: {
    ...presets.storm,
  },
}

export const LightMode: Story = {
  args: {
    ...presets.default,
    lightMode: true,
  },
}

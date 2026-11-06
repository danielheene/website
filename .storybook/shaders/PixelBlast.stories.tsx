import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PixelBlast, presets } from '@/components/Shaders/PixelBlast'

const meta = {
  title: 'PixelBlast',
  component: PixelBlast,
  parameters: {
    layout: 'padded',
  },
  args: {
    variant: 'square',
    pixelSize: 3,
    color: '#B497CF',
    accentColor: '#FDBA74',
    patternScale: 2,
    patternDensity: 1,
    pixelSizeJitter: 0,
    enableRipples: true,
    rippleIntensityScale: 1,
    rippleThickness: 0.1,
    rippleSpeed: 0.3,
    speed: 0.5,
    transparent: false,
    edgeFade: 0.25,
    noiseAmount: 0.1,
    softness: 0.6,
    smoothing: 0.5,
    glow: 0.4,
    twinkle: 0.25,
    drift: 0.2,
    driftAngle: 0,
    hoverEffect: 'reveal',
    hoverRadius: 0.35,
    autoRipple: 0,
    tiltX: 0,
    tiltY: 0,
    intro: true,
    lightMode: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['square', 'circle', 'triangle', 'diamond', 'cross', 'ring'],
      description: 'Shape geometry rendered inside each pixel.',
    },
    pixelSize: {
      control: { type: 'range', min: 1, max: 16, step: 1 },
      description: 'Size multiplier for each procedural cell.',
    },
    color: {
      control: 'color',
      description: 'Primary base color for the matrix pixels.',
    },
    accentColor: {
      control: 'color',
      description: 'Secondary accent tone for highlights and ripples.',
    },
    patternScale: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.1 },
      description: 'Spatial frequency scale of procedural noise pattern.',
    },
    patternDensity: {
      control: { type: 'range', min: 0.5, max: 2, step: 0.05 },
      description: 'Fill density of illuminated cells.',
    },
    pixelSizeJitter: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Random variation in cell size across the field.',
    },
    enableRipples: {
      control: 'boolean',
      description: 'Enable wave propagation on click / pointer interaction.',
    },
    softness: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Edge blur and shape anti-aliasing strength.',
    },
    glow: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Outer bloom emission intensity.',
    },
    twinkle: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Sparkle / shimmer modulation over time.',
    },
    drift: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Background procedural flow motion speed.',
    },
    hoverEffect: {
      control: 'select',
      options: ['reveal', 'grow', 'none'],
      description: 'Pointer interaction response mode.',
    },
    tiltX: {
      control: { type: 'range', min: -90, max: 90, step: 1 },
      description: '3D perspective tilt around X axis.',
    },
    lightMode: {
      control: 'boolean',
      description: 'Switch to high-key bright canvas palette mode.',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-[#0a0a0f] shadow-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PixelBlast>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ...presets.default,
  },
}

export const Classic: Story = {
  args: {
    ...presets.classic,
  },
}

export const Mono: Story = {
  args: {
    ...presets.mono,
  },
}

export const Ember: Story = {
  args: {
    ...presets.ember,
  },
}

export const Dots: Story = {
  args: {
    ...presets.dots,
  },
}

export const Stars: Story = {
  args: {
    ...presets.stars,
  },
}

export const Horizon: Story = {
  args: {
    ...presets.horizon,
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

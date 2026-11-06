import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GradientBlinds, presets } from '@/components/Shaders/GradientBlinds'

const meta = {
  title: 'GradientBlinds',
  component: GradientBlinds,
  parameters: {
    layout: 'padded',
  },
  args: {
    gradientColors: ['#FF9FFC', '#5227FF'],
    angle: 20,
    blindCount: 16,
    blindMinWidth: 60,
    spotlightRadius: 0.5,
    spotlightSoftness: 1,
    spotlightOpacity: 1,
    shine: 0.4,
    relief: 0.5,
    glow: 0.4,
    sway: 0.35,
    speed: 1,
    gradientSpeed: 1,
    hoverTilt: 0.6,
    clickEffect: 'ripple',
    idle: 'drift',
    shineDirection: 'left',
    distortAmount: 0,
    perspective: 0,
    noise: 0.3,
    lightColor: '#ffffff',
    lightMode: false,
    paused: false,
    intro: true,
  },
  argTypes: {
    gradientColors: {
      control: 'object',
      description: 'Multi-stop color palette for the background linear gradient.',
    },
    angle: {
      control: { type: 'range', min: -90, max: 90, step: 1 },
      description: 'Blind slat orientation angle in degrees.',
    },
    blindCount: {
      control: { type: 'range', min: 4, max: 60, step: 1 },
      description: 'Number of vertical/angled blind slats.',
    },
    blindMinWidth: {
      control: { type: 'range', min: 10, max: 120, step: 2 },
      description: 'Minimum physical width in pixels per slat.',
    },
    spotlightRadius: {
      control: { type: 'range', min: 0.1, max: 1.5, step: 0.05 },
      description: 'Interactive pointer spotlight illumination radius.',
    },
    shine: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Slat surface gloss and edge reflection intensity.',
    },
    relief: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: '3D bevel and extrusion depth between adjacent slats.',
    },
    glow: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Ambient backlight glow emission.',
    },
    sway: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Natural wave motion oscillating across the slats.',
    },
    hoverTilt: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Angular rotation strength when cursor moves across slats.',
    },
    clickEffect: {
      control: 'select',
      options: ['ripple', 'none'],
      description: 'Wave ripple deformation on pointer click.',
    },
    idle: {
      control: 'select',
      options: ['drift', 'center', 'stay'],
      description: 'Autonomous spotlight motion when pointer is idle.',
    },
    perspective: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Vanishing-point perspective distortion depth.',
    },
    lightMode: {
      control: 'boolean',
      description: 'High-key light canvas background mode.',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black shadow-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GradientBlinds>

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

export const Noir: Story = {
  args: {
    ...presets.noir,
  },
}

export const Sunset: Story = {
  args: {
    ...presets.sunset,
  },
}

export const Lagoon: Story = {
  args: {
    ...presets.lagoon,
  },
}

export const Venetian: Story = {
  args: {
    ...presets.venetian,
  },
}

export const Perspective: Story = {
  args: {
    ...presets.perspective,
  },
}

export const Drift: Story = {
  args: {
    ...presets.drift,
  },
}

export const LightMode: Story = {
  args: {
    ...presets.default,
    lightMode: true,
  },
}

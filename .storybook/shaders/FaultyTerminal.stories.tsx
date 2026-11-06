import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FaultyTerminal, presets } from '@/components/Shaders/FaultyTerminal'

const meta = {
  title: 'FaultyTerminal',
  component: FaultyTerminal,
  parameters: {
    layout: 'padded',
  },
  args: {
    tint: '#A7EF9E',
    glyphs: 'blocks',
    scale: 1.5,
    digitSize: 1.2,
    timeScale: 0.5,
    brightness: 0.75,
    glow: 0.5,
    persistence: 0.5,
    mouseStrength: 0.5,
    mouseGlow: 0.6,
    curvature: 0.1,
    vignette: 0.25,
    clickEffect: 'glitch',
    scanlineIntensity: 0.5,
    glitchAmount: 1,
    flickerAmount: 1,
    noiseAmp: 1,
    chromaticAberration: 0,
    scramble: 0,
    dither: 0,
    pause: false,
    mouseReact: true,
    pageLoadAnimation: true,
    lightMode: false,
  },
  argTypes: {
    tint: {
      control: 'color',
      description: 'Monochrome phosphor cathode ray emission color.',
    },
    glyphs: {
      control: 'select',
      options: ['blocks', 'dots', 'characters'],
      description: 'Terminal character raster matrix style.',
    },
    scale: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.1 },
      description: 'Matrix grid density scale.',
    },
    digitSize: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.05 },
      description: 'Character cell size scale.',
    },
    timeScale: {
      control: { type: 'range', min: 0, max: 2, step: 0.05 },
      description: 'Terminal animation speed.',
    },
    brightness: {
      control: { type: 'range', min: 0, max: 1.5, step: 0.05 },
      description: 'Phosphor display luminance.',
    },
    glow: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'CRT bloom and phosphor bleed intensity.',
    },
    persistence: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Phosphor decay trail latency.',
    },
    curvature: {
      control: { type: 'range', min: 0, max: 0.5, step: 0.01 },
      description: 'CRT glass tube spherical barrel distortion.',
    },
    vignette: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Screen edge falloff shading.',
    },
    clickEffect: {
      control: 'select',
      options: ['glitch', 'degauss', 'none'],
      description: 'Cathode burst animation on pointer click.',
    },
    scanlineIntensity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Horizontal raster line shading strength.',
    },
    glitchAmount: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      description: 'Horizontal sync jitter and tearing frequency.',
    },
    chromaticAberration: {
      control: { type: 'range', min: 0, max: 3, step: 0.1 },
      description: 'RGB electron gun convergence misalignment.',
    },
  },
  decorators: [
    (Story) => (
      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-[#0d0f12] shadow-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FaultyTerminal>

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

export const Terminal: Story = {
  args: {
    ...presets.terminal,
  },
}

export const Amber: Story = {
  args: {
    ...presets.amber,
  },
}

export const Ice: Story = {
  args: {
    ...presets.ice,
  },
}

export const Meltdown: Story = {
  args: {
    ...presets.meltdown,
  },
}

export const Data: Story = {
  args: {
    ...presets.data,
  },
}

export const LightMode: Story = {
  args: {
    ...presets.data,
  },
}

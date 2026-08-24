import type { Meta, StoryObj } from '@storybook/nextjs'

import DarkVeil from './DarkVeil'

const meta = {
  title: 'Shaders/DarkVeil',
  component: DarkVeil,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  // Args and control ranges match reactbits.dev's own published control panel for this
  // component.
  args: {
    hueShift: 0,
    noiseIntensity: 0,
    scanlineIntensity: 0,
    speed: 0.5,
    scanlineFrequency: 0,
    warpAmount: 0,
    resolutionScale: 1,
  },
  argTypes: {
    hueShift: {
      control: {
        type: 'range',
        min: -180,
        max: 180,
        step: 5,
      },
      description: 'Hue rotation in degrees applied to the generated field.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    noiseIntensity: {
      control: {
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      description: 'Amount of per-pixel random grain mixed into the color.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    scanlineIntensity: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Strength of the horizontal scanline darkening pass.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    speed: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.1,
      },
      description: 'Multiplier on elapsed time — how fast the field evolves.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    scanlineFrequency: {
      control: {
        type: 'range',
        min: 0,
        max: 50,
        step: 1,
      },
      description: 'Spatial frequency of the scanlines.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    warpAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Strength of the sine-based UV warp applied before sampling.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    resolutionScale: {
      control: {
        type: 'range',
        min: 0.25,
        max: 2,
        step: 0.25,
      },
      description: 'Multiplier on the render target size relative to the container.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="aspect-video w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DarkVeil>

export default meta

type Story = StoryObj<typeof meta>

/** Default — a calm, mostly-static purple field with no noise, scanlines, or warp. */
export const Default: Story = {}

/** Faster evolution and a hue rotated toward warm tones. */
export const HueShifted: Story = {
  args: {
    hueShift: 180,
    speed: 1,
  },
}

/** CRT-style scanlines layered over noise and grain. */
export const ScanlinesAndNoise: Story = {
  args: {
    scanlineIntensity: 0.6,
    scanlineFrequency: 20,
    noiseIntensity: 0.3,
  },
}

/** Strong UV warp distorting the underlying field. */
export const Warped: Story = {
  args: {
    warpAmount: 1,
    speed: 0.8,
  },
}

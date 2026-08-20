import type { Meta, StoryObj } from '@storybook/nextjs'

import Grainient from './Grainient'

const meta = {
  title: 'Shaders/Grainient',
  component: Grainient,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  // Args and control ranges match reactbits.dev's own published control panel for this
  // component.
  args: {
    timeSpeed: 0.25,
    colorBalance: 0.0,
    warpStrength: 1.0,
    warpFrequency: 5.0,
    warpSpeed: 2.0,
    warpAmplitude: 50.0,
    blendAngle: 0.0,
    blendSoftness: 0.05,
    rotationAmount: 500.0,
    noiseScale: 2.0,
    grainAmount: 0.1,
    grainScale: 2.0,
    grainAnimated: false,
    contrast: 1.5,
    gamma: 1.0,
    saturation: 1.0,
    centerX: 0.0,
    centerY: 0.0,
    zoom: 0.9,
    color1: '#FF9FFC',
    color2: '#5227FF',
    color3: '#B497CF',
  },
  argTypes: {
    timeSpeed: {
      control: {
        type: 'range',
        min: 0,
        max: 5,
        step: 0.05,
      },
      description: 'Multiplier on elapsed time — how fast the gradient warps.',
      table: {
        defaultValue: {
          summary: '0.25',
        },
      },
    },
    colorBalance: {
      control: {
        type: 'range',
        min: -1,
        max: 1,
        step: 0.01,
      },
      description: 'Shifts the blend point between the three colors.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    warpStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 4,
        step: 0.05,
      },
      description: 'Overall strength of the UV warp (inversely scales the warp amplitude).',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    warpFrequency: {
      control: {
        type: 'range',
        min: 0,
        max: 12,
        step: 0.1,
      },
      description: 'Spatial frequency of the sine-based warp.',
      table: {
        defaultValue: {
          summary: '5',
        },
      },
    },
    warpSpeed: {
      control: {
        type: 'range',
        min: 0,
        max: 6,
        step: 0.1,
      },
      description: 'Speed of the warp animation, independent of `timeSpeed`.',
      table: {
        defaultValue: {
          summary: '2',
        },
      },
    },
    warpAmplitude: {
      control: {
        type: 'range',
        min: 5,
        max: 80,
        step: 1,
      },
      description: 'Amplitude of the warp displacement.',
      table: {
        defaultValue: {
          summary: '50',
        },
      },
    },
    blendAngle: {
      control: {
        type: 'range',
        min: -180,
        max: 180,
        step: 1,
      },
      description: 'Rotation of the color blend axis, in degrees.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    blendSoftness: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
      description: 'Softness of the transition between color regions.',
      table: {
        defaultValue: {
          summary: '0.05',
        },
      },
    },
    rotationAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 1440,
        step: 10,
      },
      description: 'Strength of the noise-driven overall rotation.',
      table: {
        defaultValue: {
          summary: '500',
        },
      },
    },
    noiseScale: {
      control: {
        type: 'range',
        min: 0,
        max: 4,
        step: 0.05,
      },
      description: 'Spatial scale of the noise field driving rotation.',
      table: {
        defaultValue: {
          summary: '2',
        },
      },
    },
    grainAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 0.4,
        step: 0.01,
      },
      description: 'Strength of the grain mixed into the color.',
      table: {
        defaultValue: {
          summary: '0.1',
        },
      },
    },
    grainScale: {
      control: {
        type: 'range',
        min: 0.2,
        max: 8,
        step: 0.1,
      },
      description: 'Spatial scale of the grain pattern.',
      table: {
        defaultValue: {
          summary: '2',
        },
      },
    },
    grainAnimated: {
      control: 'boolean',
      description: 'Animates the grain over time instead of holding it static.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    contrast: {
      control: {
        type: 'range',
        min: 0,
        max: 2.5,
        step: 0.05,
      },
      description: 'Contrast applied after blending.',
      table: {
        defaultValue: {
          summary: '1.5',
        },
      },
    },
    gamma: {
      control: {
        type: 'range',
        min: 0.4,
        max: 2.5,
        step: 0.05,
      },
      description: 'Gamma correction applied to the final color.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    saturation: {
      control: {
        type: 'range',
        min: 0,
        max: 2.5,
        step: 0.05,
      },
      description: 'Saturation multiplier — 0 desaturates to grayscale.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    centerX: {
      control: {
        type: 'range',
        min: -1,
        max: 1,
        step: 0.01,
      },
      description: 'Horizontal offset of the gradient center.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    centerY: {
      control: {
        type: 'range',
        min: -1,
        max: 1,
        step: 0.01,
      },
      description: 'Vertical offset of the gradient center.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    zoom: {
      control: {
        type: 'range',
        min: 0.3,
        max: 3,
        step: 0.05,
      },
      description: 'Zoom level of the gradient.',
      table: {
        defaultValue: {
          summary: '0.9',
        },
      },
    },
    color1: {
      control: 'color',
      description: 'First gradient color.',
      table: {
        defaultValue: {
          summary: '#FF9FFC',
        },
      },
    },
    color2: {
      control: 'color',
      description: 'Second gradient color.',
      table: {
        defaultValue: {
          summary: '#5227FF',
        },
      },
    },
    color3: {
      control: 'color',
      description: 'Third gradient color.',
      table: {
        defaultValue: {
          summary: '#B497CF',
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
} satisfies Meta<typeof Grainient>

export default meta

type Story = StoryObj<typeof meta>

/** Default pink/purple/lavender warp with static grain. */
export const Default: Story = {}

/** Animated grain instead of a static, per-frame-stable pattern. */
export const AnimatedGrain: Story = {
  args: {
    grainAnimated: true,
    grainAmount: 0.2,
  },
}

/** A different three-color palette. */
export const AlternatePalette: Story = {
  args: {
    color1: '#22D3EE',
    color2: '#0EA5E9',
    color3: '#1E3A8A',
  },
}

/** Stronger warp and faster animation for a more turbulent look. */
export const Turbulent: Story = {
  args: {
    warpStrength: 2.5,
    warpFrequency: 10,
    timeSpeed: 0.6,
  },
}

/** Desaturated, higher-contrast variant. */
export const Desaturated: Story = {
  args: {
    saturation: 0.2,
    contrast: 2,
  },
}

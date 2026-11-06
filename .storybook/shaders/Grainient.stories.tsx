import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  defaultProps,
  dunesPreset,
  duskPreset,
  emberPreset,
  lagoonPreset,
  satinPreset,
  tidePreset,
} from '@/components/Shaders/Grainient/config'
import { Grainient } from '@/components/Shaders/Grainient/Grainient'

const meta = {
  title: 'Grainient',
  component: Grainient,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  args: {
    colors: defaultProps.colors,
    type: 'linear',
    angle: 55,
    bands: 1,
    speed: 1,
    flow: 0.8,
    scale: 1,
    softness: 1,
    silk: 0.35,
    grainAmount: 0.08,
    grainSize: 1.2,
    grainAnimated: true,
    contrast: 1,
    saturation: 1,
    variation: 0,
    interactive: true,
    stir: 1,
    clickSwirl: true,
    intro: true,
    lightMode: false,
  },
  argTypes: {
    colors: {
      control: 'object',
      description: 'Palette of up to 8 colors interpolated smoothly in Oklab color space.',
      table: {
        defaultValue: {
          summary: "['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa']",
        },
      },
    },
    type: {
      control: 'select',
      options: ['linear', 'radial'],
      description: 'Gradient coordinate mapping geometry (directional linear or swirling radial).',
      table: {
        defaultValue: {
          summary: 'linear',
        },
      },
    },
    angle: {
      control: {
        type: 'range',
        min: 0,
        max: 360,
        step: 1,
      },
      description: 'Angle of the linear gradient in degrees.',
      table: {
        defaultValue: {
          summary: '55',
        },
      },
    },
    bands: {
      control: {
        type: 'range',
        min: 1,
        max: 8,
        step: 1,
      },
      description: 'Number of repeating color stripes / fold cycles across the field.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    speed: {
      control: {
        type: 'range',
        min: 0,
        max: 5,
        step: 0.1,
      },
      description: 'Playback speed multiplier for the internal drift and flow time clock.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    flow: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.05,
      },
      description: 'Distortion turbulence and displacement intensity of the gradient waves.',
      table: {
        defaultValue: {
          summary: '0.8',
        },
      },
    },
    scale: {
      control: {
        type: 'range',
        min: 0.25,
        max: 3,
        step: 0.05,
      },
      description: 'Spatial scale and zoom level of the gradient noise field.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    softness: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
      description: 'Edge softness between adjacent color stops (lower creates sharper banding).',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    silk: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Specular 3D surface sheen and normal lighting response.',
      table: {
        defaultValue: {
          summary: '0.35',
        },
      },
    },
    grainAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      description: 'Luminance-weighted film grain noise intensity.',
      table: {
        defaultValue: {
          summary: '0.08',
        },
      },
    },
    grainSize: {
      control: {
        type: 'range',
        min: 0.5,
        max: 4,
        step: 0.1,
      },
      description: 'Spatial coarseness and clumping of the grain texture.',
      table: {
        defaultValue: {
          summary: '1.2',
        },
      },
    },
    grainAnimated: {
      control: 'boolean',
      description: 'Whether the film grain changes every frame or remains static.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    contrast: {
      control: {
        type: 'range',
        min: 0.2,
        max: 2,
        step: 0.05,
      },
      description: 'Post-process contrast adjustment applied in Oklab space.',
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
        max: 2,
        step: 0.05,
      },
      description: 'Color saturation multiplier in Oklab chroma space.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    variation: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 1,
      },
      description: 'Random seed index that shifts noise coordinate offsets.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    interactive: {
      control: 'boolean',
      description: 'Enables fluid pointer stirring and movement drag physics.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    stir: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.1,
      },
      description: 'Strength of pointer drag ripples and fluid wakes.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    clickSwirl: {
      control: 'boolean',
      description: 'Spawns localized vortex twirls on click/tap.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    intro: {
      control: 'boolean',
      description: 'Plays a smooth unfolding intro animation on initial load.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    lightMode: {
      control: 'boolean',
      description: 'Inverts palette curves and boosts high-key lightness values.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl mx-auto w-full max-w-5xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="relative aspect-16/9 w-full">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Grainient>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: defaultProps,
}

export const Ember: Story = {
  args: emberPreset,
}

export const Lagoon: Story = {
  args: lagoonPreset,
}

export const Dusk: Story = {
  args: duskPreset,
}

export const Satin: Story = {
  args: satinPreset,
}

export const Dunes: Story = {
  args: dunesPreset,
}

export const Tide: Story = {
  args: tidePreset,
}

export const RadialVortex: Story = {
  args: {
    ...emberPreset,
    type: 'radial',
    flow: 1.2,
    scale: 1.5,
    silk: 0.5,
  },
}

export const LightMode: Story = {
  args: {
    ...lagoonPreset,
    lightMode: true,
    grainAmount: 0.05,
    contrast: 0.9,
  },
}

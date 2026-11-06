import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Silk, presets } from '@/components/Shaders/Silk'

const meta = {
  title: 'Silk',
  component: Silk,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  args: {
    speed: 5,
    scale: 1,
    color: '#7B7481',
    sheenColor: '#ffffff',
    noiseIntensity: 1.5,
    rotation: 0,
    sheen: 0.5,
    depth: 0.5,
    glow: 0.3,
    ripple: 1,
    wave: 1,
    variation: 0,
    mouseInteraction: true,
    interactionStrength: 1,
    clickRipple: true,
    intro: true,
    fade: 0,
    lightMode: false,
    paused: false,
  },
  argTypes: {
    color: {
      control: 'color',
      description: 'Base color tint of the silk fabric.',
      table: {
        defaultValue: {
          summary: '#7B7481',
        },
      },
    },
    sheenColor: {
      control: 'color',
      description: 'Highlight color reflected off the satin folds.',
      table: {
        defaultValue: {
          summary: '#ffffff',
        },
      },
    },
    speed: {
      control: {
        type: 'range',
        min: 0,
        max: 10,
        step: 0.1,
      },
      description: 'Multiplier on elapsed time — how fast the silk flows.',
      table: {
        defaultValue: {
          summary: '5',
        },
      },
    },
    scale: {
      control: {
        type: 'range',
        min: 0.2,
        max: 4,
        step: 0.1,
      },
      description: 'Spatial scale of the fabric weave and folds.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    rotation: {
      control: {
        type: 'range',
        min: -180,
        max: 180,
        step: 5,
      },
      description: 'Rotation of the silk weave in degrees.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    sheen: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.05,
      },
      description: 'Strength of the specular shine highlights along folds.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    depth: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Depth relief and shadow contrast between folds.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    glow: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Bloom and glow radiance on fold crests.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    noiseIntensity: {
      control: {
        type: 'range',
        min: 0,
        max: 5,
        step: 0.1,
      },
      description: 'Strength of the fine fabric grain overlay.',
      table: {
        defaultValue: {
          summary: '1.5',
        },
      },
    },
    ripple: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Frequency of fine ripple undulations in the cloth.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    wave: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Amplitude of broad directional wave crests.',
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
      description: 'Seed offset for procedural fold placement.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    mouseInteraction: {
      control: 'boolean',
      description: 'Whether the fabric responds to cursor hover and drag.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    interactionStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Sensitivity of the fabric drag response to pointer movements.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    clickRipple: {
      control: 'boolean',
      description: 'Generates shockwave ripples expanding outward on click.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    intro: {
      control: 'boolean',
      description: 'Plays an introductory drape and unfold animation on mount.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    fade: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Vignette edge fade mask opacity.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    lightMode: {
      control: 'boolean',
      description: 'Switches shader shading to light background mode.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    paused: {
      control: 'boolean',
      description: 'Pauses the simulation animation loop.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    dpr: {
      control: {
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.25,
      },
      description: 'Device pixel ratio override for rendering fidelity.',
      table: {
        defaultValue: {
          summary: 'window.devicePixelRatio',
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
} satisfies Meta<typeof Silk>

export default meta

type Story = StoryObj<typeof meta>

/** Default — charcoal lavender silk with gloss highlights and interactive ripples. */
export const Default: Story = {}

/** Electric Violet — vibrant electric purple with intense sheen and glow. */
export const ElectricViolet: Story = {
  args: presets.electricViolet,
}

/** Crimson Velvet — rich deep red with angled folds and bold shadow depth. */
export const CrimsonVelvet: Story = {
  args: presets.crimsonVelvet,
}

/** Golden Satin — warm golden amber fabric with silky sheen. */
export const GoldenSatin: Story = {
  args: presets.goldenSatin,
}

/** Emerald Weave — lush emerald green satin with mint highlights. */
export const EmeraldWeave: Story = {
  args: presets.emeraldWeave,
}

/** Midnight Obsidian — moody dark fabric with cool blue edge highlights. */
export const MidnightObsidian: Story = {
  args: presets.midnightObsidian,
}

/** Pearl Light — pristine light-mode silk fabric with delicate shading. */
export const PearlLight: Story = {
  args: presets.pearlLight,
}

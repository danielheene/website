import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CRTWarp, presets } from '@/components/Shaders/CRTWarp'

const meta = {
  title: 'CRTWarp',
  component: CRTWarp,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  args: {
    color: '#c755f7',
    backgroundColor: '#120f17',
    lightMode: false,
    speed: 0.5,
    variation: 0,
    waveAmplitude: 0.3,
    waveFrequency: 2.5,
    levels: 3,
    columns: 80,
    persistence: 0.4,
    curvature: 0.25,
    corners: 0,
    scanlineStrength: 0.6,
    scanlineFrequency: 200,
    mask: 'aperture',
    maskStrength: 0.3,
    bloom: 1.5,
    bloomRadius: 1,
    rgbShift: 0.003,
    noise: 0.1,
    flicker: 0.15,
    interference: 0.2,
    vignette: 0.3,
    brightness: 1,
    intro: true,
    mouseReact: true,
    mouseStrength: 0.5,
    changeOnClick: true,
    paused: false,
  },
  argTypes: {
    color: {
      control: 'color',
      description: 'Primary phosphor emission color.',
      table: {
        defaultValue: {
          summary: '#c755f7',
        },
      },
    },
    backgroundColor: {
      control: 'color',
      description: 'Background chassis / dark unlit phosphor tone.',
      table: {
        defaultValue: {
          summary: '#120f17',
        },
      },
    },
    lightMode: {
      control: 'boolean',
      description: 'Inverts tube luminance for light-mode rendering.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    speed: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Speed of field motion evolution across time.',
      table: {
        defaultValue: {
          summary: '0.5',
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
      description: 'Seed offset index for procedural field generation.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    waveAmplitude: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.05,
      },
      description: 'Amplitude of field distortion waves.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    waveFrequency: {
      control: {
        type: 'range',
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      description: 'Spatial frequency of sinusoidal interference waves.',
      table: {
        defaultValue: {
          summary: '2.5',
        },
      },
    },
    levels: {
      control: {
        type: 'range',
        min: 2,
        max: 12,
        step: 1,
      },
      description: 'Number of quantized brightness stepping levels.',
      table: {
        defaultValue: {
          summary: '3',
        },
      },
    },
    columns: {
      control: {
        type: 'range',
        min: 10,
        max: 200,
        step: 2,
      },
      description: 'Horizontal pixel grid column resolution.',
      table: {
        defaultValue: {
          summary: '80',
        },
      },
    },
    persistence: {
      control: {
        type: 'range',
        min: 0,
        max: 0.98,
        step: 0.02,
      },
      description: 'Phosphor decay persistence / motion trail retention.',
      table: {
        defaultValue: {
          summary: '0.4',
        },
      },
    },
    curvature: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Spherical CRT bulb curvature / barrel distortion.',
      table: {
        defaultValue: {
          summary: '0.25',
        },
      },
    },
    corners: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Rounded CRT bezel corner masking.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    scanlineStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Intensity of horizontal cathode raster beam scanlines.',
      table: {
        defaultValue: {
          summary: '0.6',
        },
      },
    },
    scanlineFrequency: {
      control: {
        type: 'range',
        min: 20,
        max: 600,
        step: 10,
      },
      description: 'Total number of horizontal raster lines.',
      table: {
        defaultValue: {
          summary: '200',
        },
      },
    },
    mask: {
      control: 'select',
      options: ['aperture', 'shadow', 'slot', 'none'],
      description: 'Phosphor shadow mask / aperture grille structure.',
      table: {
        defaultValue: {
          summary: 'aperture',
        },
      },
    },
    maskStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Strength of the RGB sub-pixel phosphor mask pattern.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    bloom: {
      control: {
        type: 'range',
        min: 0,
        max: 4,
        step: 0.1,
      },
      description: 'Phosphor glow and halation radiance.',
      table: {
        defaultValue: {
          summary: '1.5',
        },
      },
    },
    bloomRadius: {
      control: {
        type: 'range',
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      description: 'Gaussian blur dispersion radius for tube glow.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    rgbShift: {
      control: {
        type: 'range',
        min: 0,
        max: 0.03,
        step: 0.001,
      },
      description: 'Horizontal chromatic aberration / electron gun misalignment.',
      table: {
        defaultValue: {
          summary: '0.003',
        },
      },
    },
    noise: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.02,
      },
      description: 'Analog RF static and grain noise.',
      table: {
        defaultValue: {
          summary: '0.1',
        },
      },
    },
    flicker: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'AC 60Hz cathode ray refresh flicker.',
      table: {
        defaultValue: {
          summary: '0.15',
        },
      },
    },
    interference: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Electromagnetic hum and horizontal tracking tearing.',
      table: {
        defaultValue: {
          summary: '0.2',
        },
      },
    },
    vignette: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Edge shadow falloff towards the tube perimeter.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    brightness: {
      control: {
        type: 'range',
        min: 0.2,
        max: 2,
        step: 0.1,
      },
      description: 'Overall electron beam exposure multiplier.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    intro: {
      control: 'boolean',
      description: 'Plays a CRT tube warm-up and degauss sequence on mount.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    mouseReact: {
      control: 'boolean',
      description: 'Magnetic field distortion following the cursor.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    mouseStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.1,
      },
      description: 'Sensitivity of magnetic lens displacement.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    changeOnClick: {
      control: 'boolean',
      description: 'Triggers a channel roll / degauss switch on click.',
      table: {
        defaultValue: {
          summary: 'true',
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
          summary: '2',
        },
      },
    },
    paused: {
      control: 'boolean',
      description: 'Pauses animation loop execution.',
      table: {
        defaultValue: {
          summary: 'false',
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
} satisfies Meta<typeof CRTWarp>

export default meta

type Story = StoryObj<typeof meta>

/** Default — purple phosphor CRT screen with subtle curvature and aperture mask. */
export const Default: Story = {}

/** Cyberpunk — neon pink cathode glow with strong chromatic aberration, flicker, and roll. */
export const Cyberpunk: Story = {
  args: presets.cyberpunk,
}

/** Amber Terminal — vintage VT220 style amber monochrome phosphor with high persistence. */
export const AmberTerminal: Story = {
  args: presets.amberTerminal,
}

/** Matrix Green — classic green phosphor monitor with slot mask and blooming. */
export const MatrixGreen: Story = {
  args: presets.matrixGreen,
}

/** Arcade Trinitron — curved arcade cabinet CRT with corner masking and aperture grille. */
export const ArcadeTrinitron: Story = {
  args: presets.arcadeTrinitron,
}

/** Clean Scanlines — flat modern digital screen with subtle scanline overlays. */
export const CleanScanlines: Story = {
  args: presets.cleanScanlines,
}

/** Light Paper — inverted cathode ray tube rendering for light background palettes. */
export const LightPaper: Story = {
  args: presets.lightPaper,
}

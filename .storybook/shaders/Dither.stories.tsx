import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Dither, presets } from '@/components/Shaders/Dither'

const meta = {
  title: 'Dither',
  component: Dither,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  args: {
    waveColor: '#bcbcbc',
    backgroundColor: '#120f17',
    ditherMode: 'bayer',
    colorNum: 4,
    pixelSize: 2,
    waveSpeed: 0.05,
    waveFrequency: 3,
    waveAmplitude: 0.3,
    scale: 1,
    contrast: 1,
    brightness: 0,
    mouseEffect: 'erase',
    mouseRadius: 0.3,
    mouseStrength: 1,
    trail: 0.5,
    disableAnimation: false,
    enableMouseInteraction: true,
    clickRipple: true,
    intro: true,
    palette: [],
  },
  argTypes: {
    waveColor: {
      control: 'color',
      description: 'Primary wave foreground color in non-palette mode.',
      table: {
        defaultValue: {
          summary: '#bcbcbc',
        },
      },
    },
    backgroundColor: {
      control: 'color',
      description: 'Base background chassis tone or "transparent".',
      table: {
        defaultValue: {
          summary: '#120f17',
        },
      },
    },
    ditherMode: {
      control: {
        type: 'select',
      },
      options: ['bayer', 'bayer4', 'bayer2', 'halftone', 'lines', 'crosshatch', 'noise', 'none'],
      description: 'Dithering algorithm pattern matrix.',
      table: {
        defaultValue: {
          summary: 'bayer',
        },
      },
    },
    colorNum: {
      control: {
        type: 'range',
        min: 2,
        max: 16,
        step: 1,
      },
      description: 'Number of quantized color bands / quantization levels.',
      table: {
        defaultValue: {
          summary: '4',
        },
      },
    },
    pixelSize: {
      control: {
        type: 'range',
        min: 1,
        max: 8,
        step: 1,
      },
      description: 'Pixelation cell size in CSS pixels.',
      table: {
        defaultValue: {
          summary: '2',
        },
      },
    },
    waveSpeed: {
      control: {
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      description: 'Evolution speed of the procedural simplex/fbm wave field.',
      table: {
        defaultValue: {
          summary: '0.05',
        },
      },
    },
    waveFrequency: {
      control: {
        type: 'range',
        min: 0.5,
        max: 8,
        step: 0.5,
      },
      description: 'Frequency density of the procedural noise harmonics.',
      table: {
        defaultValue: {
          summary: '3',
        },
      },
    },
    waveAmplitude: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Harmonic amplitude falloff per FBM octave.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    scale: {
      control: {
        type: 'range',
        min: 0.2,
        max: 3,
        step: 0.1,
      },
      description: 'Zoom / scale factor of the procedural wave coordinates.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    contrast: {
      control: {
        type: 'range',
        min: 0.2,
        max: 3,
        step: 0.1,
      },
      description: 'Contrast adjustment applied before matrix dithering.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    brightness: {
      control: {
        type: 'range',
        min: -1,
        max: 1,
        step: 0.05,
      },
      description: 'Luminance bias offset applied before quantization.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    mouseEffect: {
      control: {
        type: 'select',
      },
      options: ['erase', 'reveal', 'ripple'],
      description: 'Cursor interaction effect mode.',
      table: {
        defaultValue: {
          summary: 'erase',
        },
      },
    },
    mouseRadius: {
      control: {
        type: 'range',
        min: 0.05,
        max: 1,
        step: 0.05,
      },
      description: 'Effective radius of pointer displacement / eraser influence.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    mouseStrength: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Strength of pointer interaction displacement.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    trail: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Persistence decay of pointer motion trail.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    palette: {
      control: 'object',
      description: 'Optional discrete color palette array (overrides monochrome waveColor mode).',
      table: {
        defaultValue: {
          summary: '[]',
        },
      },
    },
    disableAnimation: {
      control: 'boolean',
      description: 'Freezes wave field time evolution.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    enableMouseInteraction: {
      control: 'boolean',
      description: 'Enables interactive pointer tracking and trail dynamics.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    clickRipple: {
      control: 'boolean',
      description: 'Triggers shockwave ripples on pointer down.',
      table: {
        defaultValue: {
          summary: 'true',
        },
      },
    },
    intro: {
      control: 'boolean',
      description: 'Plays an iris reveal opening animation on mount.',
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
} satisfies Meta<typeof Dither>

export default meta

type Story = StoryObj<typeof meta>

/** Default — monochrome 8x8 Bayer matrix dithering with subtle wave motion. */
export const Default: Story = {}

/** Classic — retro Bayer pattern with 4 quantization levels and eraser cursor. */
export const Classic: Story = {
  args: presets.classic,
}

/** Game Boy — authentic 4-shade olive green LCD palette with 3px pixelation. */
export const GameBoy: Story = {
  args: presets.gameBoy,
}

/** Newsprint — warm paper halftone screen with ink reveal cursor interaction. */
export const Newsprint: Story = {
  args: presets.newsprint,
}

/** Amber — linear scan-dither pattern with warm glowing phosphor palette. */
export const Amber: Story = {
  args: presets.amber,
}

/** Blueprint — technical drafting crosshatch dithering with oceanic blue palette and click ripples. */
export const Blueprint: Story = {
  args: presets.blueprint,
}

/** Static — 1-bit high-frequency random noise dithering with fast wave speed. */
export const Static: Story = {
  args: presets.static,
}

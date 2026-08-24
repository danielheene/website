import type { Meta, StoryObj } from '@storybook/nextjs'

import FaultyTerminal from './FaultyTerminal'

// FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement>, which would otherwise pull
// hundreds of inherited DOM event-handler props into the auto-generated arg table. Restrict
// Controls to the component's own props.
const OWN_PROP_NAMES = [
  'scale',
  'gridMul',
  'digitSize',
  'timeScale',
  'pause',
  'scanlineIntensity',
  'glitchAmount',
  'flickerAmount',
  'noiseAmp',
  'chromaticAberration',
  'dither',
  'curvature',
  'tint',
  'mouseReact',
  'mouseStrength',
  'dpr',
  'pageLoadAnimation',
  'brightness',
]

const meta = {
  title: 'Shaders/FaultyTerminal',
  component: FaultyTerminal,
  parameters: {
    controls: {
      include: OWN_PROP_NAMES,
    },
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  // Args mirror reactbits.dev's own demo defaults for this component (not the component's own
  // built-in defaults, which differ slightly — e.g. noiseAmp).
  args: {
    scale: 1.5,
    gridMul: [
      2,
      1,
    ],
    digitSize: 1.2,
    timeScale: 0.5,
    pause: false,
    scanlineIntensity: 0.5,
    glitchAmount: 1,
    flickerAmount: 1,
    noiseAmp: 1,
    chromaticAberration: 0,
    dither: 0,
    curvature: 0.1,
    tint: '#A7EF9E',
    mouseReact: true,
    mouseStrength: 0.5,
    pageLoadAnimation: true,
    brightness: 0.6,
  },
  // Control ranges match reactbits.dev's published control panel for this component.
  argTypes: {
    scale: {
      control: {
        type: 'range',
        min: 0.5,
        max: 3,
        step: 0.1,
      },
      description: 'Zoom level of the digit grid.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    gridMul: {
      control: 'object',
      description: 'Column/row multiplier `[x, y]` applied to the base digit grid.',
      table: {
        defaultValue: {
          summary: '[2, 1]',
        },
      },
    },
    digitSize: {
      control: {
        type: 'range',
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      description: 'Size of each rendered digit glyph.',
      table: {
        defaultValue: {
          summary: '1.5',
        },
      },
    },
    timeScale: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.05,
      },
      description: 'Multiplier on elapsed time — how fast the terminal animates.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    pause: {
      control: 'boolean',
      description: 'Freezes the animation loop at its current frame.',
      table: {
        defaultValue: {
          summary: 'false',
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
      description: 'Strength of the CRT scanline overlay.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    glitchAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Amount of glitch-style displacement applied to the grid.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    flickerAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.1,
      },
      description: 'Amount of brightness flicker over time.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    noiseAmp: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Amplitude of the underlying fbm noise field driving the pattern.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    chromaticAberration: {
      control: {
        type: 'range',
        min: 0,
        max: 0.1,
        step: 0.005,
      },
      description: 'Pixel offset between color channels at the edges of the curvature.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    dither: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description:
        'Dither strength. Accepts `boolean` in the component API too (`true` behaves like `1`) — this control only exercises the numeric range.',
      table: {
        defaultValue: {
          summary: '0',
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
      description: 'CRT-style barrel curvature of the screen.',
      table: {
        defaultValue: {
          summary: '0.2',
        },
      },
    },
    tint: {
      control: 'color',
      description: 'Color tint applied to the rendered digits.',
      table: {
        defaultValue: {
          summary: '#ffffff',
        },
      },
    },
    mouseReact: {
      control: 'boolean',
      description: 'Whether the pattern reacts to pointer movement.',
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
        max: 1,
        step: 0.05,
      },
      description: 'Strength of the pointer-reactive distortion, when `mouseReact` is on.',
      table: {
        defaultValue: {
          summary: '0.2',
        },
      },
    },
    dpr: {
      control: false,
      description:
        'Device pixel ratio for the render target. Defaults to the browser’s own, capped at 2.',
    },
    pageLoadAnimation: {
      control: 'boolean',
      description: 'Plays a one-time reveal animation on mount.',
      table: {
        defaultValue: {
          summary: 'true',
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
      description: 'Overall brightness multiplier.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
  },
  decorators: [
    // Same shape as reactbits.dev's own demo wrapper (plain sized div, position: relative, no
    // overflow clipping), sized to a 16:9 preview instead of a fixed 600px.
    (Story) => (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          position: 'relative',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FaultyTerminal>

export default meta

type Story = StoryObj<typeof meta>

/** reactbits.dev's own demo configuration. */
export const Default: Story = {}

/** Heavier glitch and flicker, closer to a failing terminal. */
export const Glitchy: Story = {
  args: {
    glitchAmount: 2.5,
    flickerAmount: 2,
    scanlineIntensity: 0.7,
  },
}

/** CRT curvature and chromatic aberration pushed up for an old-monitor look. */
export const CRTLook: Story = {
  args: {
    curvature: 0.6,
    chromaticAberration: 0.05,
    scanlineIntensity: 0.6,
  },
}

/** The component's own default white tint instead of the demo's green. */
export const WhiteTint: Story = {
  args: {
    tint: '#ffffff',
    brightness: 1,
  },
}

/**
 * Pointer reactivity off — the demo default has it on; this is the stable, non-interactive
 * variant.
 */
export const NoMouseReact: Story = {
  args: {
    mouseReact: false,
  },
}

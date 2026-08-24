import type { Meta, StoryObj } from '@storybook/nextjs'

import GradientBlinds from './GradientBlinds'

const meta = {
  title: 'Shaders/GradientBlinds',
  component: GradientBlinds,
  parameters: {
    // 'padded' avoids 'fullscreen' stretching the decorator to the canvas's full height, which
    // would fight the 16:9 aspect ratio below.
    layout: 'padded',
  },
  // Args and control ranges match reactbits.dev's own published control panel for this
  // component, except mixBlendMode which isn't part of their public control panel (it's in this
  // component's TS interface but not surfaced on their site).
  args: {
    paused: false,
    gradientColors: [
      '#FF9FFC',
      '#5227FF',
    ],
    angle: 0,
    noise: 0.3,
    blindCount: 16,
    blindMinWidth: 60,
    mouseDampening: 0.15,
    mirrorGradient: false,
    spotlightRadius: 0.5,
    spotlightSoftness: 1,
    spotlightOpacity: 1,
    distortAmount: 0,
    shineDirection: 'left',
    mixBlendMode: 'lighten',
  },
  argTypes: {
    paused: {
      control: 'boolean',
      description: 'Freezes the animation loop at its current frame.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    gradientColors: {
      control: 'object',
      description: 'Hex color stops (up to 8) the blinds gradient is built from.',
      table: {
        defaultValue: {
          summary: "['#FF9FFC', '#5227FF']",
        },
      },
    },
    angle: {
      control: {
        type: 'range',
        min: -180,
        max: 180,
        step: 5,
      },
      description: 'Rotation of the blinds in degrees.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    noise: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Amount of grain mixed into the gradient.',
      table: {
        defaultValue: {
          summary: '0.3',
        },
      },
    },
    blindCount: {
      control: {
        type: 'range',
        min: 4,
        max: 50,
        step: 1,
      },
      description: 'Number of vertical blind strips.',
      table: {
        defaultValue: {
          summary: '16',
        },
      },
    },
    blindMinWidth: {
      control: {
        type: 'range',
        min: 10,
        max: 200,
        step: 10,
      },
      description: 'Minimum pixel width of a single blind before the count is reduced to fit.',
      table: {
        defaultValue: {
          summary: '60',
        },
      },
    },
    mouseDampening: {
      control: {
        type: 'range',
        min: 0,
        max: 0.5,
        step: 0.05,
      },
      description: 'Smoothing factor applied to pointer-driven spotlight movement.',
      table: {
        defaultValue: {
          summary: '0.15',
        },
      },
    },
    mirrorGradient: {
      control: 'boolean',
      description: 'Mirrors the gradient stops back on themselves.',
      table: {
        defaultValue: {
          summary: 'false',
        },
      },
    },
    spotlightRadius: {
      control: {
        type: 'range',
        min: 0,
        max: 2,
        step: 0.05,
      },
      description: 'Radius of the pointer-follow spotlight, in normalized units.',
      table: {
        defaultValue: {
          summary: '0.5',
        },
      },
    },
    spotlightSoftness: {
      control: {
        type: 'range',
        min: 0,
        max: 3,
        step: 0.05,
      },
      description: 'Edge softness of the spotlight falloff.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    spotlightOpacity: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Opacity of the spotlight effect.',
      table: {
        defaultValue: {
          summary: '1',
        },
      },
    },
    distortAmount: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05,
      },
      description: 'Amount of wave distortion applied to the blinds.',
      table: {
        defaultValue: {
          summary: '0',
        },
      },
    },
    shineDirection: {
      control: {
        type: 'select',
      },
      // reactbits.dev's control panel also lists a 'none' option, but this repo's
      // GradientBlindsProps types shineDirection as 'left' | 'right' only — anything else falls
      // back to 'left' behavior in the shader logic, so 'none' isn't a real distinct option here.
      options: [
        'left',
        'right',
      ],
      description: 'Which edge the shine sweep originates from.',
      table: {
        defaultValue: {
          summary: 'left',
        },
      },
    },
    mixBlendMode: {
      control: {
        type: 'select',
      },
      options: [
        'normal',
        'lighten',
        'darken',
        'screen',
        'multiply',
        'overlay',
      ],
      description:
        'CSS `mix-blend-mode` for the canvas. Defaults to `lighten`, which washes out against a light backdrop — every story here renders on a dark decorator so the effect stays visible.',
      table: {
        defaultValue: {
          summary: 'lighten',
        },
      },
    },
    dpr: {
      control: false,
      description: 'Device pixel ratio for the render target. Defaults to the browser’s own.',
    },
  },
  decorators: [
    // mixBlendMode defaults to "lighten", which washes out to near-white against a light
    // background — the dark wrapper here is what makes the effect visible, not a component
    // requirement.
    (Story) => (
      <div className="aspect-video w-full bg-neutral-950">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GradientBlinds>

export default meta

type Story = StoryObj<typeof meta>

/** Default two-color gradient with the pointer-follow spotlight active. */
export const Default: Story = {}

/** More, narrower blinds for a finer stripe pattern. */
export const DenseBlinds: Story = {
  args: {
    blindCount: 32,
    blindMinWidth: 20,
  },
}

/** A wider color stop list instead of the default two-color gradient. */
export const MultiColor: Story = {
  args: {
    gradientColors: [
      '#FF9FFC',
      '#5227FF',
      '#22D3EE',
      '#FACC15',
    ],
  },
}

/** Wave distortion pushed up, rotated blinds. */
export const Distorted: Story = {
  args: {
    distortAmount: 0.5,
    angle: 25,
    noise: 0.6,
  },
}

/** Spotlight turned off — flat animated gradient with no pointer interaction. */
export const NoSpotlight: Story = {
  args: {
    spotlightOpacity: 0,
  },
}

import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import DarkVeil, { type DarkVeilProps } from '@/components/Shaders/DarkVeil'
import FaultyTerminal, { type FaultyTerminalProps } from '@/components/Shaders/FaultyTerminal'
import GradientBlinds, { type GradientBlindsProps } from '@/components/Shaders/GradientBlinds'
import Grainient, { type GrainientProps } from '@/components/Shaders/Grainient'

export type ShaderComponentEntry =
  | {
      key: 'darkveil'
      Component: typeof DarkVeil
      props: DarkVeilProps
    }
  | {
      key: 'faulty-terminal'
      Component: typeof FaultyTerminal
      props: FaultyTerminalProps
    }
  | {
      key: 'gradient-blinds'
      Component: typeof GradientBlinds
      props: GradientBlindsProps
    }
  | {
      key: 'grainient'
      Component: typeof Grainient
      props: GrainientProps
    }

/**
 * One curated, fixed prop bundle per shader — no per-prop admin tuning.
 * Values chosen to look good as a full-bleed hero background at rest (slow
 * motion, low noise) rather than each shader's own demo/showcase defaults.
 */
export const SHADER_COMPONENTS: Record<ShaderPresetKey, ShaderComponentEntry> = {
  darkveil: {
    key: 'darkveil',
    Component: DarkVeil,
    props: {
      hueShift: 0,
      noiseIntensity: 0.02,
      scanlineIntensity: 0,
      speed: 0.3,
      warpAmount: 0.1,
    },
  },
  'faulty-terminal': {
    key: 'faulty-terminal',
    Component: FaultyTerminal,
    props: {
      tint: '#3dff8f',
      scanlineIntensity: 0.2,
      glitchAmount: 0.5,
      flickerAmount: 0.3,
      brightness: 0.6,
      mouseReact: false,
      pageLoadAnimation: false,
    },
  },
  'gradient-blinds': {
    key: 'gradient-blinds',
    Component: GradientBlinds,
    props: {
      gradientColors: [
        '#FF9FFC',
        '#5227FF',
      ],
      angle: 15,
      noise: 0.15,
      blindCount: 12,
      mouseDampening: 0.15,
    },
  },
  grainient: {
    key: 'grainient',
    Component: Grainient,
    props: {
      color1: '#FF9FFC',
      color2: '#5227FF',
      color3: '#B497CF',
      timeSpeed: 0.15,
      grainAmount: 0.06,
    },
  },
}

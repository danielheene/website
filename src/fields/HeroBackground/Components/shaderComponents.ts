import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import DarkVeil, {
  type DarkVeilProps,
  defaultProps as darkVeilDefaults,
} from '@/components/Shaders/DarkVeil'
import FaultyTerminal, { type FaultyTerminalProps } from '@/components/Shaders/FaultyTerminal'
import GradientBlinds, {
  type GradientBlindsProps,
  defaultProps as gradientBlindsDefaults,
} from '@/components/Shaders/GradientBlinds'
import Grainient, {
  type GrainientProps,
  defaultProps as grainientDefaults,
} from '@/components/Shaders/Grainient'

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
 * DarkVeil, GradientBlinds, and Grainient share their bundles with the
 * public hero via each shader's `config.ts`. FaultyTerminal uses a
 * green-tinted preview bundle distinct from the white-tinted public hero.
 */
export const SHADER_COMPONENTS: Record<ShaderPresetKey, ShaderComponentEntry> = {
  darkveil: {
    key: 'darkveil',
    Component: DarkVeil,
    props: darkVeilDefaults,
  },
  'faulty-terminal': {
    key: 'faulty-terminal',
    Component: FaultyTerminal,
    /**
     * Admin preview props — intentionally different from the public hero
     * (see FaultyTerminal/config.ts). The green tint and reduced intensity
     * read better at the small card size in the shader picker drawer.
     */
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
    props: gradientBlindsDefaults,
  },
  grainient: {
    key: 'grainient',
    Component: Grainient,
    props: grainientDefaults,
  },
}

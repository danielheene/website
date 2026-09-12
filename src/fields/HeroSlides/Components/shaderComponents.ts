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
 * public hero via each shader's `config.ts`. FaultyTerminal uses its
 * `WhiteTint` story preset — reactbits.dev's own demo defaults with the
 * `tint`/`brightness` swap that story applies — rather than either the
 * demo's green tint or the hero's own tuned bundle.
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
     * Matches FaultyTerminal.stories.tsx's WhiteTint story: reactbits.dev's
     * demo defaults (see that file's meta.args) with tint/brightness
     * swapped to white — see that story for why.
     */
    props: {
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
      tint: '#ffffff',
      mouseReact: true,
      mouseStrength: 0.5,
      pageLoadAnimation: true,
      brightness: 1,
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

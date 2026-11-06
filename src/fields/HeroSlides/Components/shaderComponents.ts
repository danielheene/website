import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import {
  CRTWarp,
  type CRTWarpProps,
  defaultProps as crtWarpDefaults,
} from '@/components/Shaders/CRTWarp'
import {
  DarkVeil,
  type DarkVeilProps,
  defaultProps as darkVeilDefaults,
} from '@/components/Shaders/DarkVeil'
import {
  Dither,
  type DitherProps,
  defaultProps as ditherDefaults,
} from '@/components/Shaders/Dither'
import { FaultyTerminal, type FaultyTerminalProps } from '@/components/Shaders/FaultyTerminal'
import {
  GradientBlinds,
  type GradientBlindsProps,
  defaultProps as gradientBlindsDefaults,
} from '@/components/Shaders/GradientBlinds'
import {
  Grainient,
  type GrainientProps,
  defaultProps as grainientDefaults,
} from '@/components/Shaders/Grainient'
import {
  PixelBlast,
  type PixelBlastProps,
  defaultProps as pixelBlastDefaults,
} from '@/components/Shaders/PixelBlast'
import { Silk, type SilkProps, defaultProps as silkDefaults } from '@/components/Shaders/Silk'

export type ShaderComponentEntry =
  | {
      key: 'crt-warp'
      Component: typeof CRTWarp
      props: CRTWarpProps
    }
  | {
      key: 'darkveil'
      Component: typeof DarkVeil
      props: DarkVeilProps
    }
  | {
      key: 'dither'
      Component: typeof Dither
      props: DitherProps
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
  | {
      key: 'pixel-blast'
      Component: typeof PixelBlast
      props: PixelBlastProps
    }
  | {
      key: 'silk'
      Component: typeof Silk
      props: SilkProps
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
  'crt-warp': {
    key: 'crt-warp',
    Component: CRTWarp,
    props: crtWarpDefaults,
  },
  darkveil: {
    key: 'darkveil',
    Component: DarkVeil,
    props: darkVeilDefaults,
  },
  dither: {
    key: 'dither',
    Component: Dither,
    props: ditherDefaults,
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
      gridMul: [2, 1],
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
  'pixel-blast': {
    key: 'pixel-blast',
    Component: PixelBlast,
    props: pixelBlastDefaults,
  },
  silk: {
    key: 'silk',
    Component: Silk,
    props: silkDefaults,
  },
}

'use client'

import dynamic from 'next/dynamic'

import type { ShaderPresetKey } from './shaderPresets'

/**
 * One `dynamic()` call per preset, built once at module scope. Building
 * these inside the component body would create a new lazy component on
 * every render, defeating memoization and risking remounts on re-render.
 */
const SHADER_COMPONENTS: Record<ShaderPresetKey, ReturnType<typeof dynamic>> = {
  darkveil: dynamic(() => import('@/components/Shaders/DarkVeil'), {
    ssr: false,
  }),
  'faulty-terminal': dynamic(() => import('@/components/Shaders/FaultyTerminal'), {
    ssr: false,
  }),
  'gradient-blinds': dynamic(() => import('@/components/Shaders/GradientBlinds'), {
    ssr: false,
  }),
  grainient: dynamic(() => import('@/components/Shaders/Grainient'), {
    ssr: false,
  }),
}

/**
 * The same curated per-preset prop bundles as the admin picker's
 * `SHADER_COMPONENTS` (`src/fields/HeroBackground/Components/shaderComponents.ts`)
 * — intentionally duplicated rather than shared, since that file lives on
 * the admin-only client bundle and this one lives on the public frontend
 * bundle; sharing it would pull admin-picker code into the public bundle
 * for no benefit. Keep the two in sync by hand if a preset's tuning changes.
 */
const SHADER_PROPS: Record<ShaderPresetKey, Record<string, unknown>> = {
  darkveil: {
    hueShift: 0,
    noiseIntensity: 0.02,
    scanlineIntensity: 0,
    speed: 0.3,
    warpAmount: 0.1,
  },
  'faulty-terminal': {
    tint: '#3dff8f',
    scanlineIntensity: 0.2,
    glitchAmount: 0.5,
    flickerAmount: 0.3,
    brightness: 0.6,
    mouseReact: false,
    pageLoadAnimation: false,
  },
  'gradient-blinds': {
    gradientColors: [
      '#FF9FFC',
      '#5227FF',
    ],
    angle: 15,
    noise: 0.15,
    blindCount: 12,
    mouseDampening: 0.15,
  },
  grainient: {
    color1: '#FF9FFC',
    color2: '#5227FF',
    color3: '#B497CF',
    timeSpeed: 0.15,
    grainAmount: 0.06,
  },
}

export interface ShaderHeroBackgroundProps {
  presetKey: ShaderPresetKey
  className?: string
}

/**
 * Renders the given shader preset full-bleed, live. Dynamically imported
 * (`ssr: false`) since the shader components read `window` at
 * default-parameter-evaluation time, not just inside effects — a static
 * import here would crash server rendering.
 */
export const ShaderHeroBackground = ({ presetKey, className }: ShaderHeroBackgroundProps) => {
  const Shader = SHADER_COMPONENTS[presetKey]

  return (
    <div className={className} data-testid="shader-hero-background" data-preset={presetKey}>
      <Shader {...SHADER_PROPS[presetKey]} />
    </div>
  )
}

export default ShaderHeroBackground

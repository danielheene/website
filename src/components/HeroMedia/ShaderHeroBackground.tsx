'use client'

import dynamic from 'next/dynamic'

import { defaultProps as crtWarpDefaults } from '@/components/Shaders/CRTWarp/config'
import { defaultProps as darkVeilDefaults } from '@/components/Shaders/DarkVeil/config'
import { defaultProps as ditherDefaults } from '@/components/Shaders/Dither/config'
import { defaultProps as faultyTerminalDefaults } from '@/components/Shaders/FaultyTerminal/config'
import { defaultProps as gradientBlindsDefaults } from '@/components/Shaders/GradientBlinds/config'
import { defaultProps as grainientDefaults } from '@/components/Shaders/Grainient/config'
import { defaultProps as pixelBlastDefaults } from '@/components/Shaders/PixelBlast/config'
import { defaultProps as silkDefaults } from '@/components/Shaders/Silk/config'

import type { ShaderPresetKey } from './shaderPresets'

/**
 * One `dynamic()` call per preset, built once at module scope. Building
 * these inside the component body would create a new lazy component on
 * every render, defeating memoization and risking remounts on re-render.
 */
const SHADER_COMPONENTS: Record<ShaderPresetKey, ReturnType<typeof dynamic>> = {
  'crt-warp': dynamic(() => import('@/components/Shaders/CRTWarp').then((mod) => mod.CRTWarp), {
    ssr: false,
  }),
  darkveil: dynamic(() => import('@/components/Shaders/DarkVeil').then((mod) => mod.DarkVeil), {
    ssr: false,
  }),
  dither: dynamic(() => import('@/components/Shaders/Dither').then((mod) => mod.Dither), {
    ssr: false,
  }),
  'faulty-terminal': dynamic(
    () => import('@/components/Shaders/FaultyTerminal').then((mod) => mod.FaultyTerminal),
    {
      ssr: false,
    },
  ),
  'gradient-blinds': dynamic(
    () => import('@/components/Shaders/GradientBlinds').then((mod) => mod.GradientBlinds),
    {
      ssr: false,
    },
  ),
  grainient: dynamic(() => import('@/components/Shaders/Grainient').then((mod) => mod.Grainient), {
    ssr: false,
  }),
  'pixel-blast': dynamic(
    () => import('@/components/Shaders/PixelBlast').then((mod) => mod.PixelBlast),
    {
      ssr: false,
    },
  ),
  silk: dynamic(() => import('@/components/Shaders/Silk').then((mod) => mod.Silk), {
    ssr: false,
  }),
}

/**
 * Per-preset prop bundles sourced from each shader's `config.ts`.
 * The admin picker (`src/fields/HeroSlides/Components/shaderComponents.ts`)
 * keeps its own preview-tuned bundles — these are the production/public values.
 */
const SHADER_PROPS: Record<ShaderPresetKey, object> = {
  'crt-warp': crtWarpDefaults,
  darkveil: darkVeilDefaults,
  dither: ditherDefaults,
  'faulty-terminal': faultyTerminalDefaults,
  'gradient-blinds': gradientBlindsDefaults,
  grainient: grainientDefaults,
  'pixel-blast': pixelBlastDefaults,
  silk: silkDefaults,
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

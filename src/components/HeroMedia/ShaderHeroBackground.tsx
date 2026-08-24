'use client'

import dynamic from 'next/dynamic'

import { defaultProps as darkVeilDefaults } from '@/components/Shaders/DarkVeil/config'
import { defaultProps as faultyTerminalDefaults } from '@/components/Shaders/FaultyTerminal/config'
import { defaultProps as gradientBlindsDefaults } from '@/components/Shaders/GradientBlinds/config'
import { defaultProps as grainientDefaults } from '@/components/Shaders/Grainient/config'

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
 * Per-preset prop bundles sourced from each shader's `config.ts`.
 * The admin picker (`src/fields/HeroBackground/Components/shaderComponents.ts`)
 * keeps its own preview-tuned bundles — these are the production/public values.
 */
const SHADER_PROPS: Record<ShaderPresetKey, object> = {
  darkveil: darkVeilDefaults,
  'faulty-terminal': faultyTerminalDefaults,
  'gradient-blinds': gradientBlindsDefaults,
  grainient: grainientDefaults,
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

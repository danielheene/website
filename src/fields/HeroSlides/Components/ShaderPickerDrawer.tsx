'use client'

import dynamic from 'next/dynamic'

import { SHADER_PRESETS, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

import { MediaPickerDrawer } from './MediaPickerDrawer'
import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

export interface ShaderPickerDrawerProps {
  slug: string
  value?: ShaderPresetKey
  onSelectAction: (key: ShaderPresetKey) => void
}

/**
 * Shader-preset source for the shared `MediaPickerDrawer` shell. Each card
 * renders its shader live — not a static screenshot.
 *
 * Running up to 4 live WebGL contexts at once here is intentional (per the
 * design's confirmed choice) — dynamic-imported with `ssr: false` since the
 * shader components touch `window` outside of any effect.
 */
export const ShaderPickerDrawer = ({ slug, value, onSelectAction }: ShaderPickerDrawerProps) => {
  return (
    <MediaPickerDrawer
      items={SHADER_PRESETS.map((preset) => ({
        id: preset.key,
        label: preset.label,
        onSelect: () => onSelectAction(preset.key),
        selected: value === preset.key,
        thumbnail: (
          <ShaderPreviewCanvas className="h-full w-full" entry={SHADER_COMPONENTS[preset.key]} />
        ),
      }))}
      slug={slug}
      title="Select a shader background"
    />
  )
}

export default ShaderPickerDrawer

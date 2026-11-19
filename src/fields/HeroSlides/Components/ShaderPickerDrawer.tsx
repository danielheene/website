'use client'

import { SHADER_PRESETS, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

import { MediaPickerDrawer } from './MediaPickerDrawer'
import { ShaderThumbnail } from './ShaderThumbnail'

export interface ShaderPickerDrawerProps {
  slug: string
  value?: ShaderPresetKey
  onSelectAction: (key: ShaderPresetKey) => void
}

/**
 * Shader-preset source for the shared `MediaPickerDrawer` shell. Each card
 * shows the preset's preview image rather than running the shader live.
 */
export const ShaderPickerDrawer = ({ slug, value, onSelectAction }: ShaderPickerDrawerProps) => {
  return (
    <MediaPickerDrawer
      items={SHADER_PRESETS.map((preset) => ({
        id: preset.key,
        label: preset.label,
        onSelect: () => onSelectAction(preset.key),
        selected: value === preset.key,
        thumbnail: <ShaderThumbnail presetKey={preset.key} />,
      }))}
      slug={slug}
      title="Select a shader background"
    />
  )
}

export default ShaderPickerDrawer

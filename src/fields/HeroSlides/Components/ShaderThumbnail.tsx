'use client'

import { cn } from 'tailwind-variants'

import { SHADER_PRESET_MAP, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

export interface ShaderThumbnailProps {
  presetKey: ShaderPresetKey
  className?: string
}

/**
 * A shader preset's static preview image (its `thumbnail.png`). The admin
 * shows these instead of running the shaders live, which would cost one
 * WebGL context per visible preview.
 */
export const ShaderThumbnail = ({ presetKey, className }: ShaderThumbnailProps) => {
  const preset = SHADER_PRESET_MAP[presetKey]

  if (!preset) return null

  return (
    // oxlint-disable-next-line nextjs/no-img-element -- a small admin-only preview, not a page asset
    <img
      alt={preset.label}
      className={cn('size-full object-cover', className)}
      data-testid="shader-thumbnail"
      src={preset.thumbnail.src}
    />
  )
}

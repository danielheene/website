'use client'

import { cn } from 'tailwind-variants'

import { SHADER_PRESET_MAP, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import { ImageMedia } from '@/components/ImageMedia'

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
    <ImageMedia
      alt={preset.label}
      className={cn('absolute inset-0 size-full object-cover', className)}
      data-testid="shader-thumbnail"
      url={preset.thumbnail.src}
      blurDataURL={preset.thumbnail.blurDataURL}
      fill
    />
  )
}

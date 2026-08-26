import type { StaticImageData } from 'next/image'

import { SHADER_PRESET_META, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresetMeta'
import darkVeilThumbnail from '@/components/Shaders/DarkVeil/thumbnail.png'
import faultyTerminalThumbnail from '@/components/Shaders/FaultyTerminal/thumbnail.png'
import gradientBlindsThumbnail from '@/components/Shaders/GradientBlinds/thumbnail.png'
import grainientThumbnail from '@/components/Shaders/Grainient/thumbnail.png'

export type { ShaderPresetKey }

export type ShaderPreset = {
  key: ShaderPresetKey
  label: string
  /**
   * A statically imported screenshot of this preset's real on-screen look,
   * for contexts that cannot run WebGL: OG images (Takumi/next-og cannot
   * execute canvas/WebGL) and the blog list view's card thumbnails.
   *
   * Replace each `thumbnail.png` inside the shader's folder with an actual
   * screenshot when you want pixel-accurate previews.
   */
  thumbnail: StaticImageData
}

const THUMBNAILS: Record<ShaderPresetKey, StaticImageData> = {
  darkveil: darkVeilThumbnail,
  'faulty-terminal': faultyTerminalThumbnail,
  'gradient-blinds': gradientBlindsThumbnail,
  grainient: grainientThumbnail,
}

// Presentation data layered onto shaderPresetMeta's key/label — anything
// that only needs identity/labels (a Payload field config, the seed
// scripts) should import from shaderPresetMeta directly instead of here, so
// it doesn't pull in these bundler-only `.png` imports. See that module's
// docstring for why.
export const SHADER_PRESETS: ShaderPreset[] = SHADER_PRESET_META.map((meta) => ({
  ...meta,
  thumbnail: THUMBNAILS[meta.key],
}))

export const SHADER_PRESET_MAP: Record<ShaderPresetKey, ShaderPreset> = Object.fromEntries(
  SHADER_PRESETS.map((preset) => [
    preset.key,
    preset,
  ]),
) as Record<ShaderPresetKey, ShaderPreset>

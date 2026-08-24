import type { StaticImageData } from 'next/image'

import darkVeilThumbnail from '@/components/Shaders/DarkVeil/thumbnail.png'
import faultyTerminalThumbnail from '@/components/Shaders/FaultyTerminal/thumbnail.png'
import gradientBlindsThumbnail from '@/components/Shaders/GradientBlinds/thumbnail.png'
import grainientThumbnail from '@/components/Shaders/Grainient/thumbnail.png'

export type ShaderPresetKey = 'darkveil' | 'faulty-terminal' | 'gradient-blinds' | 'grainient'

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

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    key: 'darkveil',
    label: 'Dark Veil',
    thumbnail: darkVeilThumbnail,
  },
  {
    key: 'faulty-terminal',
    label: 'Faulty Terminal',
    thumbnail: faultyTerminalThumbnail,
  },
  {
    key: 'gradient-blinds',
    label: 'Gradient Blinds',
    thumbnail: gradientBlindsThumbnail,
  },
  {
    key: 'grainient',
    label: 'Grainient',
    thumbnail: grainientThumbnail,
  },
]

export const SHADER_PRESET_MAP: Record<ShaderPresetKey, ShaderPreset> = Object.fromEntries(
  SHADER_PRESETS.map((preset) => [
    preset.key,
    preset,
  ]),
) as Record<ShaderPresetKey, ShaderPreset>

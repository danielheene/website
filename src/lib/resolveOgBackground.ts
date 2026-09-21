import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'
import { toSlideItems } from '@/components/HeroMedia/toSlideItems'

type OgBackground =
  | {
      kind: 'image'
      url: string
    }
  | {
      kind: 'shader'
      thumbnailSrc: string
    }
  | {
      kind: 'none'
    }

/**
 * Resolves the OG image background from a hero slides array, falling back to
 * a default slides array (e.g. `SiteSettings.general.defaultOpengraphImage`)
 * when the primary array yields nothing renderable.
 */
export function resolveOgBackground(slides: unknown, fallbackSlides?: unknown): OgBackground {
  for (const source of [
    slides,
    fallbackSlides,
  ]) {
    const [firstSlide] = toSlideItems(source, '')
    if (firstSlide?.kind === 'image')
      return {
        kind: 'image',
        url: firstSlide.url,
      }
    if (firstSlide?.kind === 'shader') {
      const thumbnailSrc = SHADER_PRESET_MAP[firstSlide.presetKey]?.thumbnail.src
      if (thumbnailSrc)
        return {
          kind: 'shader',
          thumbnailSrc,
        }
    }
  }
  return {
    kind: 'none',
  }
}

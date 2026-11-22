import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'
import { toSlideItems } from '@/components/HeroMedia/toSlideItems'

import { OG_BACKGROUND_FALLBACK_PATH } from './constants'

const slideImageSrc = (slides: unknown): string | undefined => {
  const [firstSlide] = toSlideItems(slides, '')

  if (firstSlide?.kind === 'image') return firstSlide.url

  if (firstSlide?.kind === 'video') return firstSlide.poster

  if (firstSlide?.kind === 'shader') return SHADER_PRESET_MAP[firstSlide.presetKey]?.thumbnail.src

  return undefined
}

/**
 * The absolute URL of a still that stands in for a hero in an Open Graph
 * image: the first slide's image, a video's poster frame or a shader's
 * thumbnail. Only the first slide counts, since a static image can't depict a
 * carousel. Falls back to `fallbackSlides` (the site-wide default) when the
 * document's own hero yields nothing, and to the bundled dither background when that is empty too.
 */
export const resolveOgBackground = (slides: unknown, fallbackSlides?: unknown): string => {
  const src = slideImageSrc(slides) ?? slideImageSrc(fallbackSlides) ?? OG_BACKGROUND_FALLBACK_PATH

  // The renderer fetches by URL, so bundled assets need the server's origin.
  return new URL(src, process.env.SERVER_URL).href
}

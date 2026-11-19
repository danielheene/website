import { OG_CONTENT_TYPE, OG_SIZE } from './constants'
import { ogImageUrl, type OgTarget } from './ogTarget'

/** `openGraph.images` / `twitter.images` entry for a page's metadata. */
export const ogImageMetadata = (target: OgTarget, alt: string, version?: string | null) => ({
  url: ogImageUrl(target, version),
  ...OG_SIZE,
  alt,
  type: OG_CONTENT_TYPE,
})

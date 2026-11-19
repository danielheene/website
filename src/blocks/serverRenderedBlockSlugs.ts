import { BlockSlug } from '@/types/blocks'

/**
 * Rich-text blocks whose renderers are async Server Components (they fetch
 * data). `RichText` renders on the client, so these are rendered ahead of time
 * by `renderServerBlocks` and handed to it by block id.
 */
export const SERVER_RENDERED_BLOCK_SLUGS = [
  BlockSlug.LegalPublisherInformation,
  BlockSlug.LegalAttributions,
] as const

export type ServerRenderedBlockSlug = (typeof SERVER_RENDERED_BLOCK_SLUGS)[number]

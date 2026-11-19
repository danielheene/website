import { PAGE_BLOCK_SLUGS } from '@/blocks'
import type { Page } from '@/types/payload'

import { RESUME_PAGE_SLUG } from '../constants'
import { LEGAL_BLOCK_SLUGS } from './legalBlocks'

/**
 * Blocks offered in a page's `sections`: the resume blocks only on the resume
 * page, and never the legal blocks, which live inside rich-text content.
 */
export const getFilteredBlocks = ({ slug }: Partial<Page>) =>
  PAGE_BLOCK_SLUGS.filter((blockSlug) => {
    if (LEGAL_BLOCK_SLUGS.includes(blockSlug)) return false

    if (blockSlug.startsWith('Resume')) return slug === RESUME_PAGE_SLUG

    return true
  })

import type { Page } from '@/types/payload'

import { BLOCK_SLUGS } from '@/blocks'

export const getFilteredBlocks = ({ layout }: Partial<Page>) => {
  let allowedSlugs = Object.values(BLOCK_SLUGS)

  if (layout !== 'resume') allowedSlugs = allowedSlugs.filter((s) => !s.startsWith('Resume'))

  return allowedSlugs
}

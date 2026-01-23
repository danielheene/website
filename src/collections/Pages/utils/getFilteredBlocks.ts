import { BLOCK_SLUGS } from '@/blocks'
import { Page } from '@payload-types'

export const getFilteredBlocks = ({ layout }: Partial<Page>) => {
  let allowedSlugs = Object.values(BLOCK_SLUGS)

  if (layout !== 'resume') allowedSlugs = allowedSlugs.filter((s) => !s.startsWith('Resume'))

  return allowedSlugs
}

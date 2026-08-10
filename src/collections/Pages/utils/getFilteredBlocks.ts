import { BLOCK_SLUGS } from '@/blocks'
import type { Page } from '@/types/payload'

export const getFilteredBlocks = ({ layout }: Partial<Page>) => {
  let allowedSlugs = Object.values(BLOCK_SLUGS)

  if (layout !== 'resume') allowedSlugs = allowedSlugs.filter((s) => !s.startsWith('Resume'))
  if (layout !== 'legal') allowedSlugs = allowedSlugs.filter((s) => !s.startsWith('Legal'))

  return allowedSlugs
}

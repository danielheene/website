import slugify from '@sindresorhus/slugify'

import type { BlockData, RegisteredBlockSlug } from '@/types/blocks'

export interface ExtractedSection {
  id: string
  title: string
}

/**
 * Derives the section navigation from a page's block list.
 *
 * Blocks carry their own `title` (with an `afterRead` fallback to the block
 * label), so the nav is known before render rather than assembled from child
 * effects on mount. Anchors are slugified from the title, matching what
 * `SectionContainer` renders as its `id`.
 *
 * Only blocks that render a `SectionContainer` produce an anchor — a block
 * without a title is skipped rather than given an empty entry.
 */
export const extractSections = (
  blocks: BlockData<RegisteredBlockSlug>[] | null | undefined,
): ExtractedSection[] => {
  if (!Array.isArray(blocks)) return []

  const sections: ExtractedSection[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    const title = (
      block as {
        title?: unknown
      }
    )?.title
    if (typeof title !== 'string' || title.trim() === '') continue

    const id = slugify(title)
    if (id === '' || seen.has(id)) continue

    seen.add(id)
    sections.push({
      id,
      title,
    })
  }

  return sections
}

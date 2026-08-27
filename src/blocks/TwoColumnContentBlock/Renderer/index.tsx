import type { JSX } from 'react'

import { highlightRichText } from '@/lib/shiki/highlightRichText'
import type { TwoColumnContentBlock } from '@/types/payload'

import { Columns } from './Columns'

type TwoColumnContentBlockRendererProps = {
  className?: string
} & TwoColumnContentBlock

/**
 * Server Component so code blocks can be highlighted before `RichText` — a
 * Client Component — renders them.
 */
export const TwoColumnContentBlockRenderer = async ({
  className,
  contentLeft,
  contentRight,
}: TwoColumnContentBlockRendererProps): Promise<JSX.Element> => {
  const [highlightedLeft, highlightedRight] = await Promise.all([
    highlightRichText(contentLeft),
    highlightRichText(contentRight),
  ])

  return (
    <Columns
      className={className}
      contentLeft={contentLeft}
      contentRight={contentRight}
      highlightedLeft={highlightedLeft}
      highlightedRight={highlightedRight}
    />
  )
}

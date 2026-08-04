import type { JSX } from 'react'

import { cn } from '@repo/utils/cn'

import RichText from '@/components/RichText'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import type { OneColumnContentBlock } from '@/types/payload'

type OneColumnContentBlockRendererProps = {
  className?: string
} & OneColumnContentBlock

/**
 * Server Component so code blocks can be highlighted before `RichText` — a
 * Client Component — renders them.
 */
export const OneColumnContentBlockRenderer = async ({
  className,
  content,
}: OneColumnContentBlockRendererProps): Promise<JSX.Element> => (
  <div className={cn(className)}>
    <RichText
      data={content}
      enableGutter={false}
      highlightedCode={await highlightRichText(content)}
    />
  </div>
)

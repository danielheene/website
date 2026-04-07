'use client'

import type { OneColumnContentBlock } from '@payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/cn'

type OneColumnContentBlockRendererProps = {
  className?: string
} & OneColumnContentBlock

export const OneColumnContentBlockRenderer = ({ className, content }: OneColumnContentBlockRendererProps) => (
  <div className={cn(className)}>
    <RichText data={content} enableGutter={false} />
  </div>
)

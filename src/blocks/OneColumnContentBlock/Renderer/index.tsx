'use client'

import type { JSX } from 'react'

import RichText from '@/components/RichText'
import { cn } from '@/lib/cn'
import type { OneColumnContentBlock } from '@/types/payload'

type OneColumnContentBlockRendererProps = {
  className?: string
} & OneColumnContentBlock

export const OneColumnContentBlockRenderer = ({
  className,
  content,
}: OneColumnContentBlockRendererProps): JSX.Element => (
  <div className={cn(className)}>
    <RichText data={content} enableGutter={false} />
  </div>
)

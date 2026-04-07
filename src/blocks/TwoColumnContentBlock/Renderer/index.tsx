'use client'

import type { TwoColumnContentBlock } from '@payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/cn'

type TwoColumnContentBlockRendererProps = {
  className?: string
} & TwoColumnContentBlock

export const TwoColumnContentBlockRenderer = ({ className, contentLeft, contentRight }: TwoColumnContentBlockRendererProps) => (
  <div className={cn('grid', className)}>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentLeft} enableGutter={false} />
    </div>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentRight} enableGutter={false} />
    </div>
  </div>
)

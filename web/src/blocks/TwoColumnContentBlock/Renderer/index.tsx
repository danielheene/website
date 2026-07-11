'use client'

import type { JSX } from 'react'

import RichText from '@/components/RichText'
import { cn } from '@/lib/cn'
import type { TwoColumnContentBlock } from '@/types/payload'

type TwoColumnContentBlockRendererProps = {
  className?: string
} & TwoColumnContentBlock

export const TwoColumnContentBlockRenderer = ({
  className,
  contentLeft,
  contentRight,
}: TwoColumnContentBlockRendererProps): JSX.Element => (
  <div className={cn('grid', className)}>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentLeft} enableGutter={false} />
    </div>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={contentRight} enableGutter={false} />
    </div>
  </div>
)

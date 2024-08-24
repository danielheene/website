import type { BannerBlock as BannerBlockProps } from '@payload-types'

import { cn } from '@/utilities/cn'
import React from 'react'
import RichText from '@/components/RichText'
import { Banner } from '@/components/Banner'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => (
  <Banner variant={style} className={cn('mx-auto my-8 w-full', className)}>
    <RichText content={content} enableGutter={false} enableProse={false} />
  </Banner>
)

import type { TwoColumnContentBlock } from '@payload-types'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/cn'

type TwoColumnContentRendererProps = {
  className?: string
} & TwoColumnContentBlock

export const TwoColumnContentRenderer = ({ className, left, right }: TwoColumnContentRendererProps) => (
  <div className={cn('grid', className)}>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={left} enableGutter={false} />
    </div>
    <div className={cn('col-span-12 md:col-span-6')}>
      <RichText data={right} enableGutter={false} />
    </div>
  </div>
)

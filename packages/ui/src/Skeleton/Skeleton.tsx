import type React from 'react'

import { type ClassValue, cn } from '@repo/utils/cn'

export interface SkeletonProps extends Omit<React.HTMLProps<HTMLDivElement>, 'className'> {
  ref?: React.Ref<HTMLDivElement>
  className?: ClassValue
  noPulse?: boolean
}

export const Skeleton = ({ ref, className, noPulse, ...props }: SkeletonProps) => {
  return (
    <aside
      ref={ref}
      className={cn([
        'skeleton',
        'bg-accent relative rounded-xs overflow-hidden',
        !noPulse && 'animate-pulse',
      ])}
      {...props}
    />
  )
}

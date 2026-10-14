import type React from 'react'

import { type ClassValue, cn } from 'tailwind-variants'

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
        'relative overflow-hidden rounded-xs bg-accent',
        !noPulse && 'animate-pulse',
        className,
      ])}
      {...props}
    />
  )
}

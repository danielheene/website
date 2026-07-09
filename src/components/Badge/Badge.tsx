import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

const variants = {
  color: {
    primary: 'bg-primary text-white',
    gray: 'bg-gray-100/50 text-gray-600',
  },
  hashtag: {
    true: `before:inline before:content-['#'] before:mr-0.5`,
    false: 'before:content-none',
  },
  size: {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-lg',
  },
}

interface BadgeProps {
  children?: ReactNode
  className?: string
  color: keyof typeof variants.color
  hashtag: keyof typeof variants.hashtag
  size: keyof typeof variants.size
}

export const Badge = ({ color, size, hashtag, children, className }: BadgeProps) => {
  return (
    <span
      className={cn([
        'inline-flex items-center rounded-sm px-2 py-1',
        'font-medium font-mono select-none',
        variants.color[color],
        variants.hashtag[hashtag],
        variants.size[size],
        className,
      ])}
    >
      {children}
    </span>
  )
}

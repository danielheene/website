import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/utilities/cn'

export const badgeVariants = cva('inline-flex items-center rounded-md px-2 py-1 font-medium font-mono select-none', {
  defaultVariants: {
    color: 'gray',
    size: 'default',
    hashtag: false,
  },
  variants: {
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
  },
})

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children?: ReactNode
  className?: string
}

export const Badge = ({ color, size, hashtag, children, className }: BadgeProps) => {
  return <span className={cn(badgeVariants({ className, color, size, hashtag }), className)}>{children}</span>
}

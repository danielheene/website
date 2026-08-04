import type { ReactNode } from 'react'

import { cn } from '@repo/utils/cn'
import { tv, VariantProps } from 'tailwind-variants'

const variants = {
  color: {
    primary: 'bg-primary text-primary-foreground',
    gray: 'bg-muted text-muted-foreground',
  },
  style: {},
  hashtag: {
    true: `before:inline before:content-['#'] before:mr-0.5`,
    false: 'before:content-none',
  },
  size: {},
}

export const badgeStyles = tv({
  base: cn([
    'inline-flex items-center rounded-sm px-2 py-1',
    'font-medium font-mono select-none',
    'border ',
  ]),
  variants: {
    color: {
      neutral: cn([
        '[--badge-color:var(--color-neutral-600)]',
        'dark:[--badge-color:var(--color-neutral-400)]',
      ]),
      primary: cn([
        '[--badge-color:var(--color-primary-600)]',
        'dark:[--badge-color:var(--color-primary-400)]',
      ]),
      info: cn([
        '[--badge-color:var(--color-info-600)]',
        'dark:[--badge-color:var(--color-info-400)]',
      ]),
      success: cn([
        '[--badge-color:var(--color-success-600)]',
        'dark:[--badge-color:var(--color-success-400)]',
      ]),
      warning: cn([
        '[--badge-color:var(--color-warning-600)]',
        'dark:[--badge-color:var(--color-warning-400)]',
      ]),
      error: cn([
        '[--badge-color:var(--color-error-600)]',
        'dark:[--badge-color:var(--color-error-400)]',
      ]),
    },
    style: {
      solid: cn([
        'border-(--badge-color)',
        'bg-(--badge-color)',
        'text-(--color-white)',
      ]),
      light: cn([
        'border-(--badge-color)',
        'bg-[color-mix(in_oklab,var(--badge-color)_25%,var(--color-white)_75%)]',
        'text-[color-mix(in_oklab,var(--badge-color)_75%,var(--color-black)_25%)]',
      ]),
      outline: cn([
        'border-(--badge-color)',
        'bg-transparent',
        'text-(--badge-color)',
      ]),
    },
    size: {
      sm: 'text-[0.625rem]',
      md: 'text-[0.750rem]',
      lg: 'text-[0.875rem]',
    },
  },
  defaultVariants: {
    color: 'neutral',
    style: 'light',
    size: 'md',
  },
})

export interface BadgeProps extends VariantProps<typeof badgeStyles> {
  children?: ReactNode
  className?: string
}

export const Badge = ({ color, style, size, children, className }: BadgeProps) => {
  return (
    <span
      className={badgeStyles({
        color,
        style,
        size,
        class: className,
      })}
    >
      {children}
    </span>
  )
}

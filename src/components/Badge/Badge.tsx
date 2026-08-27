import { ComponentProps, forwardRef, ReactNode } from 'react'

import * as Slot from '@radix-ui/react-slot'
import { cn, tv, VariantProps } from 'tailwind-variants'

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
        'bg-[color-mix(in_oklab,var(--badge-color)_15%,var(--color-background)_85%)]',
        'text-[color-mix(in_oklab,var(--badge-color)_75%,var(--color-foreground)_25%)]',
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
  /**
   * Renders the Badge's styles onto its single child (via Radix Slot)
   * instead of a `<span>` — e.g. ServiceStatus renders a `<Link>` badge,
   * which needs `href`/anchor semantics the Badge itself doesn't have.
   * Mirrors Button's `asChild`.
   */
  asChild?: boolean
}

const BadgeSlot = Slot.createSlot<HTMLSpanElement, BadgeProps>('Badge.Slot')

export const Badge = forwardRef<HTMLSpanElement, BadgeProps & ComponentProps<'span'>>(
  ({ color, style, size, children, className, asChild, ...props }, ref) => {
    const Component = asChild ? BadgeSlot : 'span'

    return (
      <Component
        ref={ref}
        className={badgeStyles({
          color,
          style,
          size,
          class: className,
        })}
        {...props}
      >
        {children}
      </Component>
    )
  },
)

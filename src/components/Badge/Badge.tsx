import { forwardRef, ReactNode } from 'react'

import * as Slot from '@radix-ui/react-slot'
import { cn, tv, VariantProps } from 'tailwind-variants'

export const badgeStyles = tv({
  base: cn([
    'border-(--badge-border-color) bg-(--badge-background-color)',
    'text-(length:--badge-text-size) leading-(--badge-text-size) text-(--badge-text-color)',
    'flex w-fit items-center px-[0.5em] py-[0.4em]',
    'font-mono font-normal select-none',
    'rounded-sm border whitespace-nowrap',
  ]),
  variants: {
    color: {
      primary: '[--badge-color:var(--color-primary-600)]',
      info: '[--badge-color:var(--color-info-600)]',
      success: '[--badge-color:var(--color-success-600)]',
      warning: '[--badge-color:var(--color-warning-700)]',
      error: '[--badge-color:var(--color-error-600)]',
      red: '[--badge-color:var(--color-red-600)]',
      orange: '[--badge-color:var(--color-orange-700)]',
      amber: '[--badge-color:var(--color-amber-700)]',
      yellow: '[--badge-color:var(--color-yellow-700)]',
      lime: '[--badge-color:var(--color-lime-700)]',
      green: '[--badge-color:var(--color-green-700)]',
      emerald: '[--badge-color:var(--color-emerald-600)]',
      teal: '[--badge-color:var(--color-teal-600)]',
      cyan: '[--badge-color:var(--color-cyan-600)]',
      sky: '[--badge-color:var(--color-sky-600)]',
      blue: '[--badge-color:var(--color-blue-600)]',
      indigo: '[--badge-color:var(--color-indigo-600)]',
      violet: '[--badge-color:var(--color-violet-600)]',
      purple: '[--badge-color:var(--color-purple-600)]',
      fuchsia: '[--badge-color:var(--color-fuchsia-600)]',
      pink: '[--badge-color:var(--color-pink-600)]',
      rose: '[--badge-color:var(--color-rose-600)]',
      gray: '[--badge-color:var(--color-gray-600)]',
    },
    style: {
      solid: cn([
        '[--badge-border-color:var(--badge-color)]',
        '[--badge-background-color:var(--badge-color)]',
        '[--badge-text-color:contrast-color(var(--badge-color))]',
      ]),
      light: cn([
        '[--badge-border-color:var(--badge-color)]',
        '[--badge-background-color:color-mix(in_oklab,var(--badge-color)_15%,var(--color-transparent)_85%)]',
        '[--badge-text-color:color-mix(in_oklab,var(--badge-color)_10%,contrast-color(var(--color-background))_90%)]',
      ]),
      outline: cn([
        '[--badge-border-color:var(--badge-color)]',
        '[--badge-background-color:var(--color-transparent)]',
        '[--badge-text-color:var(--badge-color)]',
      ]),
    },
    size: {
      sm: '[--badge-text-size:0.875rem]',
      md: '[--badge-text-size:1rem]',
      lg: '[--badge-text-size:1.25rem]',
    },
  },
  defaultVariants: {
    color: 'gray',
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

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
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

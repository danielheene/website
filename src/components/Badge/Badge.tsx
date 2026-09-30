import { forwardRef, ReactNode } from 'react'

import * as Slot from '@radix-ui/react-slot'
import { cn, tv, VariantProps } from 'tailwind-variants'

export const badgeStyles = tv({
  base: cn([
    'flex items-center px-[0.5em] py-[0.25em] w-fit',
    'font-medium font-mono select-none',
    'border whitespace-nowrap',
  ]),
  variants: {
    color: {
      neutral: '[--badge-color:var(--color-neutral-600)]',
      primary: '[--badge-color:var(--color-primary-600)]',
      info: '[--badge-color:var(--color-info-600)]',
      success: '[--badge-color:var(--color-success-600)]',
      warning: '[--badge-color:var(--color-warning-700)]',
      error: '[--badge-color:var(--color-error-600)]',
      secondary: '[--badge-color:var(--color-secondary-700)]',
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
      slate: '[--badge-color:var(--color-slate-600)]',
      gray: '[--badge-color:var(--color-gray-600)]',
      zinc: '[--badge-color:var(--color-zinc-600)]',
      stone: '[--badge-color:var(--color-stone-600)]',
    },
    style: {
      solid: cn([
        'border-(--badge-color)',
        'bg-(--badge-color)',
        'text-(--color-white)',
      ]),
      light: cn([
        'border-(--badge-color)',
        'bg-[color-mix(in_oklab,var(--badge-color)_10%,var(--color-background)_90%)]',
        'text-[color-mix(in_oklab,var(--badge-color)_75%,var(--color-foreground)_25%)]',
      ]),
      outline: cn([
        'border-(--badge-color)',
        'bg-transparent',
        'text-[color-mix(in_oklab,var(--badge-color)_75%,var(--color-foreground)_25%)]',
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

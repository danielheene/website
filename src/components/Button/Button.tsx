'use client'

import { ComponentProps, forwardRef } from 'react'
import Link from 'next/link'

import { Button as HeadlessButton, ButtonProps as HeadlessButtonProps } from '@headlessui/react'
import { tv, VariantProps } from 'tailwind-variants'

import { IconName } from '@/components/Icon'

const styles = tv({
  base: [
    'group/button inline-flex shrink-0 items-center justify-center rounded-none',
    'border border-transparent bg-clip-padding',
    'text-xs font-semibold tracking-widest whitespace-nowrap uppercase',
    'transition-all outline-none select-none',
    'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
    'active:not-aria-[haspopup]:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  ],
  variants: {
    variant: {
      default: [
        'bg-primary text-primary-foreground hover:bg-primary/80',
      ],
      outline: [
        'border-border bg-transparent hover:bg-muted hover:text-foreground',
        'aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-input/30',
      ],
      secondary: [
        'bg-secondary text-secondary-foreground',
        'hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
        'aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
      ],
      ghost: [
        'hover:bg-muted hover:text-foreground',
        'aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
      ],
      destructive: [
        'bg-destructive/10 text-destructive hover:bg-destructive/20',
        'focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
        'dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
      ],
      link: [
        'text-primary underline underline-offset-4 hover:underline',
      ],
    },
    size: {
      default: [
        'h-10 gap-1.5 px-6',
        'has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
      ],
      xs: [
        "h-7 gap-1 px-3 [&_svg:not([class*='size-'])]:size-3",
        'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      ],
      sm: [
        'h-9 gap-1 px-4',
        'has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
      ],
      lg: [
        'h-11 gap-1.5 px-8',
        'has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5',
      ],
      icon: [
        'size-10',
      ],
      'icon-xs': [
        "size-7 [&_svg:not([class*='size-'])]:size-3",
      ],
      'icon-sm': [
        'size-9',
      ],
      'icon-lg': [
        'size-11',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface CommonProps
  extends Omit<HeadlessButtonProps, 'type'>,
    VariantProps<typeof styles> {
  leftIcon?: IconName
  rightIcon?: IconName
}

type ConditionalProps =
  | ({
      type: 'link'
    } & ComponentProps<typeof Link>)
  | ({
      type: 'button' | 'submit' | 'reset'
    } & ComponentProps<'button'>)

type ButtonProps = CommonProps & ConditionalProps

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      leftIcon,
      rightIcon,
      type = 'button',
      className,

      variant,
      size,
      ...props
    },
    ref,
  ) => {
    const Component = type === 'link' ? Link : 'button'

    return (
      <HeadlessButton
        ref={ref}
        as={Component}
        className={styles({
          variant,
          size,
          class: className,
        })}
        {...props}
      />
    )
  },
)

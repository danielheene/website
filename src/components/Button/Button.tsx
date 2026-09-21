'use client'

import { ComponentProps, forwardRef, ReactNode } from 'react'

import { createSlot, createSlottable } from '@radix-ui/react-slot'
import { tv, VariantProps } from 'tailwind-variants'

import { Icon } from '@/components/Icon'

export const buttonStyles = tv({
  base: [
    'group/button inline-flex shrink-0 items-center justify-center rounded-none',
    'text-(--button-text-color) text-md font-mono font-medium whitespace-nowrap uppercase',
    'bg-(--button-background-color) bg-clip-padding',
    'border-(--button-border-color) border',
    'transition-all outline-none select-none cursor-pointer',
    'focus-visible:ring-2 focus-visible:ring-ring/30',
    'active:not-aria-[haspopup]:translate-y-px',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4.5",
  ],
  variants: {
    variant: {
      default: [
        '[--button-text-color:var(--color-primary-foreground)] hover:[--button-text-color:var(--color-primary-foreground)]',
        '[--button-background-color:var(--color-primary)] hover:[--button-background-color:color-mix(in_oklch,var(--color-primary),var(--color-transparent)_20%)]',
        '[--button-border-color:var(--color-primary)] hover:[--button-border-color:color-mix(in_oklch,var(--color-primary),var(--color-transparent)_20%)]',
      ],
      outline: [
        '[--button-text-color:var(--color-foreground)] hover:[--button-text-color:var(--color-foreground)]',
        '[--button-background-color:var(--color-transparent)] hover:[--button-background-color:var(--color-muted)]',
        '[--button-border-color:var(--color-border)] hover:[--button-border-color:var(--color-border)]',
      ],
      secondary: [
        '[--button-text-color:var(--color-secondary-foreground)] hover:[--button-text-color:var(--color-secondary-foreground)]',
        '[--button-background-color:var(--color-secondary)] hover:[--button-background-color:color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)]',
        '[--button-border-color:var(--color-secondary)] hover:[--button-border-color:color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)]',
      ],
      ghost: [
        '[--button-text-color:var(--color-foreground)] hover:[--button-text-color:var(--color-foreground)]',
        '[--button-background-color:var(--color-transparent)] hover:[--button-background-color:var(--color-muted)]',
        '[--button-border-color:var(--color-transparent)] hover:[--button-border-color:var(--color-border)]',
      ],
      destructive: [
        '[--button-text-color:var(--color-destructive)] hover:[--button-text-color:var(--color-destructive)]',
        '[--button-background-color:color-mix(in_oklch,var(--color-destructive)_10%,var(--color-foreground)_90%)] hover:[--button-background-color:color-mix(in_oklch,var(--color-destructive)_20%,var(--color-foreground)_80%)]',
        '[--button-border-color:color-mix(in_oklch,var(--color-destructive)_40%,var(--color-foreground)_60%)] hover:[--button-border-color:color-mix(in_oklch,var(--color-destructive)_60%,var(--color-foreground)_40%)]',
        'focus-visible:ring-destructive/20',
      ],
      link: [
        '[--button-text-color:var(--color-foreground)] hover:[--button-text-color:var(--color-foreground)]',
        '[--button-background-color:var(--color-transparent)] hover:[--button-background-color:var(--color-transparent)]',
        '[--button-border-color:var(--color-transparent)] hover:[--button-border-color:var(--color-transparent)] border-none',
        'normal-case underline underline-offset-4 hover:underline px-0!',
      ],
    },
    size: {
      default: [
        'min-h-10 gap-1.5 px-4',
        'has:data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
      ],
      xs: [
        "min-h-7 gap-1 px-4 [&>svg:not([class*='size-'])]:size-3 text-sm",
        'has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1',
      ],
      sm: [
        'min-h-9 gap-1 px-2.5',
        'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
      ],
      lg: [
        'min-h-11 gap-1.5 px-4',
        'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      ],

      'icon-xs': [
        'size-7',
        "[&>svg:not([class*='size-'])]:size-3.5",
      ],
      'icon-sm': [
        'size-9',
        "[&>svg:not([class*='size-'])]:size-4.5",
      ],
      icon: [
        'size-10',
        "[&>svg:not([class*='size-'])]:size-5",
      ],
      'icon-lg': [
        'size-11',
        "[&>svg:not([class*='size-'])]:size-5.5",
      ],
    },
    fullWidth: {
      false: '',
      true: 'flex w-full grow shrink-0',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    fullWidth: false,
  },
})

export interface ButtonProps extends VariantProps<typeof buttonStyles> {
  children?: ReactNode
  startIcon?: string
  endIcon?: string
  asChild?: boolean
}

const ButtonSlot = createSlot<HTMLButtonElement, ButtonProps>('Button.Slot')
const ButtonSlottable = createSlottable('Button.Slottable')

export const Button = forwardRef<HTMLButtonElement, ButtonProps & ComponentProps<'button'>>(
  (
    { variant, size, fullWidth, startIcon, endIcon, className, asChild, children, ...props },
    ref,
  ) => {
    const Component = asChild ? ButtonSlot : 'button'

    return (
      <Component
        ref={ref}
        className={buttonStyles({
          variant,
          size,
          fullWidth,
          class: className,
        })}
        {...props}
      >
        {startIcon && <Icon name={startIcon} data-icon="inline-start" />}
        {asChild ? <ButtonSlottable>{children}</ButtonSlottable> : children}
        {endIcon && <Icon name={endIcon} data-icon="inline-end" />}
      </Component>
    )
  },
)

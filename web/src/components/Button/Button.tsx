import * as React from 'react'

import * as SlotPrimitive from '@radix-ui/react-slot'

import { cn } from '@/lib/cn'

const sizeClass = {
  clear: '',
  default: 'min-h-10 px-4 py-2',
  'icon-sm': 'text-[32px] h-[1em] w-[1em] p-0',
  icon: 'text-[40px] h-[1em] w-[1em] p-0',
  'icon-lg': 'text-[48px] h-[1em] w-[1em] p-0',
  lg: 'min-h-11 rounded px-8',
  sm: 'min-h-9 rounded px-3',
}

const variantClass = {
  default: 'bg-neutral-50 hover:bg-neutral-100 text-primary',
  primary: 'bg-primary hover:bg-primary-accent text-primary-foreground',

  ghost: 'bg-card/0 hover:bg-card/100 text-card-foreground',
  link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
  navLink:
    'text-inherit text-lg font-bold items-start justify-start underline-offset-4 hover:underline',
  outline: 'border border-border bg-background hover:bg-card hover:text-accent-foreground',
  secondary: 'bg-white border border-primary text-primary hover:bg-white/80 ',

  info: 'bg-info hover:bg-info-accent text-info-foreground',
  warning: 'bg-warning hover:bg-warning-accent text-warning-foreground',
  success: 'bg-success hover:bg-success-accent text-success-foreground',
  error: 'bg-error hover:bg-error-accent text-error-foreground',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: keyof typeof variantClass
  size?: keyof typeof sizeClass
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size = 'default', variant = 'default', ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Root : 'button'

    return (
      <Comp
        className={cn(
          [
            'inline-flex items-center justify-center',
            'transition-constants whitespace-nowrap rounded',
            'text-sm font-mono font-medium ',
            'disabled:pointer-events-none disabled:opacity-50',
            '[&>iconify-icon]:text-[0.55em]',
          ],
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utilities/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-mono font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: 'min-h-10 px-4 py-2',
        icon: 'text-4xl h-[1em] w-[1em] p-0 [&>iconify-icon]:text-[0.8em]',
        lg: 'min-h-11 rounded px-8',
        sm: 'min-h-9 rounded px-3',
      },
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-card hover:text-accent-foreground',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
        navLink: 'text-inherit text-lg font-bold items-start justify-start underline-offset-4 hover:underline',
        outline: 'border border-border bg-background hover:bg-card hover:text-accent-foreground',
        secondary: 'bg-white text-primary hover:bg-white/80 ',
      },
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
                                                                   asChild = false,
                                                                   className,
                                                                   size,
                                                                   variant,
                                                                   ...props
                                                                 }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }

import React, { JSX } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { TooltipContentProps } from '@radix-ui/react-tooltip'
import { cn } from 'tailwind-variants'

interface TooltipProps extends TooltipContentProps {
  children: React.ReactNode
  content: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
}

// No Provider here — it's mounted once, globally, by `TooltipProvider`
// (`src/components/AdminPanel/TooltipProvider`). Nesting one per instance
// made Radix mount a separate Root/Portal/Content tree per Provider instead
// of sharing one, which showed up as duplicate tooltip content in the DOM
// when many `Tooltip`s render at once (e.g. `IconGrid`'s few hundred cells).
export const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  delayDuration,
  ...props
}: TooltipProps): JSX.Element => {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          align="center"
          className={cn([
            'rounded-xl',
            'select-none bg-sidebar-accent-foreground text-sidebar-accent px-2 py-1 text-[15px] leading-none',
            'shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]',
            'will-change-[transform,opacity] font-pp-supply-sans',
            'data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade',
            'data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade',
            'data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade',
            'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade',
            '[&>span>svg]:fill-sidebar-accent-foreground z-999999',
            className,
          ])}
          {...props}
        >
          {content}
          <TooltipPrimitive.Arrow width={11} height={5} className="text-accent" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

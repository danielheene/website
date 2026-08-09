import React, { JSX } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { TooltipContentProps } from '@radix-ui/react-tooltip'

import { cn } from '@/lib/cn'

interface TooltipProps extends TooltipContentProps {
  children: React.ReactNode
  content: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: TooltipProps): JSX.Element => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align="center"
            className={cn([
              'TooltipContent',
              className,
            ])}
            {...props}
          >
            {content}
            <TooltipPrimitive.Arrow width={11} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

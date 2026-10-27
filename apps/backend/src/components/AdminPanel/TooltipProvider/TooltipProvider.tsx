'use client'

import type { ReactNode } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface TooltipProviderProps {
  children: ReactNode
}

/**
 * Mounts a single Radix tooltip Provider around the whole admin panel.
 *
 * `Tooltip` itself no longer renders a Provider — nesting one per instance
 * (e.g. once per cell in `IconGrid`, which can mount hundreds at once) made
 * Radix mount a Root/Portal/Content tree per nested Provider instead of
 * sharing one, which is what produced duplicate tooltip content in the DOM.
 */
export const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <TooltipPrimitive.Provider>{children}</TooltipPrimitive.Provider>
}

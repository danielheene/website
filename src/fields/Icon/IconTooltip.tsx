'use client'

import { type ReactNode, useState } from 'react'
import { Tooltip } from '@payloadcms/ui'

export interface IconTooltipProps {
  /** Text to reveal — typically the icon name, or `alias (full:name)`. */
  label: string
  children: ReactNode
  className?: string
}

/**
 * Hover/focus wrapper around Payload's `Tooltip`.
 *
 * `Tooltip` is controlled — it renders whatever `show` says and manages no
 * hover state of its own — so every caller has to own that state. Payload's own
 * `Button` does exactly this inline; this pulls the same pattern out.
 *
 * Used by the picker's grid cells only. The field control deliberately has no
 * tooltip — it names its icon through `aria-label` instead.
 *
 * Focus is wired alongside hover so the name is reachable by keyboard, and the
 * wrapper is `relative` because `Tooltip` positions itself absolutely.
 */
export const IconTooltip = ({ label, children, className }: IconTooltipProps) => {
  const [show, setShow] = useState<boolean>(false)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: presentational hover container — the interactive element is the child button, and focus/blur bubble up from it
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <Tooltip show={show}>{label}</Tooltip>
      {children}
    </div>
  )
}

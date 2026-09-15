'use client'

import type { ReactNode } from 'react'
import { Drawer, useModal } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

export interface MediaPickerItem {
  id: string
  label: string
  /** The card's preview — an `<img>`, a live shader canvas, whatever fits the source. */
  thumbnail: ReactNode
  onSelect: () => void
  disabled?: boolean
  /** Marks this item as the field's current value, e.g. the active shader preset. */
  selected?: boolean
}

export interface MediaPickerDrawerProps {
  slug: string
  title: string
  items: MediaPickerItem[]
  /** Shown above the grid — a search input, a "no results" message, a loading state. */
  toolbar?: ReactNode
  /** Shown below the grid — a "Load more" button, pagination. */
  footer?: ReactNode
  isLoading?: boolean
  emptyMessage?: string
}

/**
 * The shared "browse and pick a thumbnail" drawer shell for every hero-slide
 * source — the existing image/video library, Unsplash search results, and
 * the shader gallery all render through this so picking any of them feels
 * like one consistent system rather than four different UI patterns.
 *
 * A source with its own async state (Unsplash's search input, pagination)
 * owns that state itself and passes the resulting `items`/`toolbar`/`footer`
 * in; this component only renders the shell and the grid.
 */
export const MediaPickerDrawer = ({
  slug,
  title,
  items,
  toolbar,
  footer,
  isLoading,
  emptyMessage = 'Nothing to show yet.',
}: MediaPickerDrawerProps) => {
  const { closeModal } = useModal()

  return (
    <Drawer slug={slug} title={title}>
      {toolbar}

      {!isLoading && items.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <button
            aria-label={item.label}
            aria-pressed={item.selected}
            className={cn([
              'flex flex-col gap-2 rounded-md border border-input p-2 text-left transition-colors',
              'hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'aria-pressed:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-60',
            ])}
            disabled={item.disabled}
            key={item.id}
            onClick={() => {
              item.onSelect()
              closeModal(slug)
            }}
            type="button"
          >
            <div className="aspect-video w-full overflow-hidden rounded-sm bg-black/5">
              {item.thumbnail}
            </div>
            <span className="line-clamp-1 text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {footer}
    </Drawer>
  )
}

/**
 * Opens/closes the drawer identified by `slug` — a thin wrapper around
 * `useModal` so callers don't each need their own import of it.
 */
export const useMediaPickerDrawer = (slug: string) => {
  const { openModal, closeModal } = useModal()
  return {
    open: () => openModal(slug),
    close: () => closeModal(slug),
  }
}

export default MediaPickerDrawer

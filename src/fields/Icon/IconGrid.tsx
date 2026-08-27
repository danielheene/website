'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from 'tailwind-variants'

import { Icon, type IconName } from '@/components/Icon'

import { IconTooltip } from './IconTooltip'

/**
 * Minimum edge of one icon button, in px (2rem at the admin's 16px root).
 *
 * The grid packs as many whole columns of at least this size as the drawer is
 * wide, so buttons grow to fill the row rather than shrinking below a
 * comfortable hit target.
 */
const MIN_CELL_PX = 40

/** Gap between cells, in px — kept in sync with the `gap-1` class below. */
const GAP_PX = 8

/** Rows rendered above and below the viewport, to cover fast scrolling. */
const OVERSCAN_ROWS = 4

export interface IconGridProps {
  icons: string[]
  isSelected: (icon: string) => boolean
  onSelectAction: (icon: string) => void
  /** Title/label for a candidate, e.g. showing the alias behind a full name. */
  describe?: (icon: string) => string
}

/**
 * Scrollable icon grid that mounts only the rows in view.
 *
 * Collections run to 15,463 icons (`material-symbols`), and every `<Icon />`
 * resolves its own SVG through Iconify — so mounting the whole set would issue
 * thousands of requests and stall the browser. Windowing keeps the DOM at the
 * couple of hundred cells actually on screen while the full list stays
 * scrollable, which is what lets the picker offer a complete collection instead
 * of an arbitrary first slice.
 */
export const IconGrid = ({ icons, isSelected, onSelectAction, describe }: IconGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState<number>(0)
  const [viewportHeight, setViewportHeight] = useState<number>(0)
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  const [columns, setColumns] = useState<number>(1)

  // measure before paint so the first frame already has the real column count
  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const measure = () => {
      const width = element.clientWidth
      // n columns need n cells plus (n - 1) gaps to fit
      const fitted = Math.floor((width + GAP_PX) / (MIN_CELL_PX + GAP_PX))
      setColumns(Math.max(1, fitted))
      setViewportWidth(width)
      setViewportHeight(element.clientHeight)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // a new result set scrolls back to the top, or the window would sit at an
  // offset the shorter list no longer has
  // biome-ignore lint/correctness/useExhaustiveDependencies: resetting on identity change is the point
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
    })
    setScrollTop(0)
  }, [
    icons,
  ])

  // cells are square, so row height follows from the measured column width
  const columnWidth =
    viewportWidth > 0
      ? Math.max(MIN_CELL_PX, (viewportWidth - GAP_PX * (columns - 1)) / columns)
      : MIN_CELL_PX
  const rowHeight = columnWidth + GAP_PX

  const rowCount = Math.ceil(icons.length / columns)
  const firstRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS)
  const visibleRows = Math.ceil(viewportHeight / rowHeight) + OVERSCAN_ROWS * 2
  const lastRow = Math.min(rowCount, firstRow + visibleRows)

  const visible = icons.slice(firstRow * columns, lastRow * columns)

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      className="max-h-64 overflow-y-auto scrollbar-none"
    >
      {/* full-height spacer keeps the scrollbar honest about the whole set */}
      <div
        style={{
          height: rowCount * rowHeight,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: firstRow * rowHeight,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(${MIN_CELL_PX}px, 1fr))`,
            gap: GAP_PX,
          }}
        >
          {visible.map((candidate) => {
            const selected = isSelected(candidate)
            const label = describe?.(candidate) ?? candidate

            return (
              // the tooltip wrapper is the grid cell, so it carries the sizing
              // and the button fills it
              <IconTooltip key={candidate} label={label} className="aspect-square w-full min-w-8">
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => onSelectAction(candidate)}
                  className={cn([
                    'flex w-full cursor-pointer items-center justify-center rounded-md border text-foreground transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:ring-2 focus-visible:ring-ring',
                    // selection is the border only — no fill, no colour shift —
                    // so the icon renders exactly as it does everywhere else.
                    // The transparent border is always present, so colouring it
                    // shifts nothing.
                    selected ? 'border-primary' : 'border-transparent',
                  ])}
                >
                  <Icon name={candidate as IconName} className="size-5 text-[20px]" />
                </button>
              </IconTooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

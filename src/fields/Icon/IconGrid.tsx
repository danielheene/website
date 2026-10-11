'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { isEqual } from 'lodash-es'
import { cn } from 'tailwind-variants'

import { Icon, type IconName } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'

const MIN_CELL_PX = 50
const GAP_PX = 8
const OVERSCAN_ROWS = 4

export interface IconGridProps {
  icons: string[]
  isSelected: (icon: string) => boolean
  onSelectAction: (icon: string) => void
  describe?: (icon: string) => string
}

/**
 * Scrollable icon grid that mounts only the rows in view.
 *
 * Collections run to 15,463 icons (`material-symbols`), and every `<Icon />`
 * resolves its own SVG through Iconify — so mounting the whole set would issue
 * thousands of requests and stall the browser. Windowing keeps the DOM at the
 * couple of a hundred cells actually on screen while the full list stays
 * scrollable, which is what lets the picker offer a complete collection instead
 * of an arbitrary first slice.
 */
export const IconGrid = ({ icons, isSelected, onSelectAction, describe }: IconGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevIconsRef = useRef<string[]>(icons)
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
  useEffect(() => {
    if (!isEqual(prevIconsRef.current, icons)) {
      prevIconsRef.current = icons
      scrollRef.current?.scrollTo({
        top: 0,
      })
      setScrollTop(0)
    }
  }, [icons])

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
      className="min-h-0 flex-1 overflow-y-auto scrollbar-none"
    >
      {/* full-height spacer keeps the scrollbar honest about the whole set */}
      <div
        style={{
          height: rowCount * rowHeight,
          position: 'relative',
        }}
      >
        <div
          className={cn(['absolute left-0 right-0', 'grid'])}
          style={{
            top: firstRow * rowHeight,
            gridTemplateColumns: `repeat(${columns}, minmax(${MIN_CELL_PX}px, 1fr))`,
            gap: GAP_PX,
          }}
        >
          {visible.map((candidate) => {
            const selected = isSelected(candidate)
            const label = describe?.(candidate) ?? candidate

            return (
              <Tooltip key={candidate} delayDuration={350} content={label}>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => onSelectAction(candidate)}
                  className={cn([
                    'flex w-full items-center justify-center',
                    'aspect-square border-none p-0 m-0',
                    'cursor-pointer text-foreground transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:ring-2 focus-visible:ring-ring',
                  ])}
                >
                  <Icon name={candidate as IconName} className="size-[65%]" />
                </button>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </div>
  )
}

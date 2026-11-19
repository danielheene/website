import type { JSX, ReactNode } from 'react'

import { cn } from 'tailwind-variants'

export interface DiagonalMarqueeProps<T extends { id: string }> {
  /** One entry per row, each in the order that row shows its items. */
  rows: T[][]
  renderItem: (item: T) => ReactNode
  /** Rotation of the whole band, in degrees. */
  angle?: number
  /** Seconds a row takes to scroll by one copy; each row varies around it. */
  duration?: number
  className?: string
}

// Matches the band's `gap-6`.
const ROW_GAP = '1.5rem'
const OVERSCAN = 1.1

// Rows drift against each other instead of moving in lockstep.
const SPEED_FACTORS = [1, 0.85, 1.15, 0.95, 1.25, 0.9, 1.1]

/**
 * Decorative background: rows of items, rotated as one band, each row
 * scrolling endlessly and alternating direction. Fills its nearest positioned
 * ancestor and is hidden from assistive technology — callers that need the
 * items announced render them accessibly elsewhere.
 */
export const DiagonalMarquee = <T extends { id: string }>({
  rows,
  renderItem,
  angle = -25,
  duration = 80,
  className,
}: DiagonalMarqueeProps<T>): JSX.Element | null => {
  if (rows.length === 0) return null

  /**
   * Rows share the thickness a band rotated by `angle` needs to cover the
   * whole container (width·sin + height·cos), minus the gaps between them,
   * with a little overscan so no corner shows through. Items fill the row
   * height.
   */
  const tilt = `${Math.abs(angle)}deg`
  const rowHeight = `calc((100cqw * sin(${tilt}) + 100cqh * cos(${tilt})) * ${OVERSCAN} / ${rows.length} - ${ROW_GAP} * ${rows.length - 1} / ${rows.length})`

  return (
    <div
      aria-hidden
      className={cn([
        '@container-size pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none',
        className,
      ])}
    >
      <div
        className="flex w-[200vw] shrink-0 flex-col gap-6"
        style={{
          transform: `rotate(${angle}deg)`,
        }}
      >
        {rows.map((row, rowIndex) => {
          // The row twice per copy, so one copy is always wider than the band
          // and the loop never shows a gap.
          const copy = [...row, ...row]

          return (
            <div
              key={rowIndex}
              className="flex overflow-hidden"
              style={{
                height: rowHeight,
              }}
            >
              <div
                className={cn([
                  'flex shrink-0 animate-diagonal-marquee motion-reduce:[animation-play-state:paused]',
                  rowIndex % 2 === 1 && '[animation-direction:reverse]',
                ])}
                style={{
                  animationDuration: `${duration * SPEED_FACTORS[rowIndex % SPEED_FACTORS.length]}s`,
                }}
              >
                {[0, 1].map((half) => (
                  <div key={half} className="flex shrink-0 gap-6 pr-6">
                    {copy.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="shrink-0">
                        {renderItem(item)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

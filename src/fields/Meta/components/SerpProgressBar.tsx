'use client'

import { useMemo } from 'react'

export interface SerpProgressBarConfig {
  /** Soft character limit (Google truncation point). */
  charLimit: number
  /** Maximum rendered pixel width on Google SERP. */
  lineWidth: number
  /** Font string passed to Canvas `measureText`, e.g. `"bold 20px Arial"`. */
  font: string
}

interface SerpProgressBarProps {
  value: string
  config: SerpProgressBarConfig
}

function measurePixelWidth(value: string, font: string): number {
  if (typeof document === 'undefined') return 0
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(value).width
}

export const SerpProgressBar = ({ value, config }: SerpProgressBarProps) => {
  const { charLimit, lineWidth, font } = config

  const chars = value.length
  const pixels = useMemo(
    () => measurePixelWidth(value, font),
    [
      value,
      font,
    ],
  )

  const charRatio = chars / charLimit
  const pixelRatio = pixels / lineWidth
  const ratio = Math.max(charRatio, pixelRatio)
  const pct = Math.min(ratio * 100, 100)

  const fillCls = ratio >= 1 ? 'serp-bar__fill--danger' : ratio >= 0.8 ? 'serp-bar__fill--warn' : ''
  const charOver = chars > charLimit
  const pixelOver = pixels > lineWidth

  return (
    <div className="serp-bar">
      <div className="serp-bar__row">
        <div className="serp-bar__track">
          <div
            className={`serp-bar__fill ${fillCls}`}
            style={{
              width: `${pct}%`,
            }}
          />
        </div>
        <span className="serp-bar__label">
          <span className={charOver ? 'serp-bar__label--over' : ''}>
            {chars}/{charLimit} chars
          </span>
          <span className="serp-bar__separator">·</span>
          <span className={pixelOver ? 'serp-bar__label--over' : ''}>
            {Math.round(pixels)}/{lineWidth} px
          </span>
        </span>
      </div>
    </div>
  )
}

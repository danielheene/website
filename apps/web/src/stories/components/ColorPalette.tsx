import React, { Fragment, FunctionComponent } from 'react'

import { cn } from '@repo/utils/cn'
import { ResetWrapper } from 'storybook/internal/components'

type Colors =
  | string[]
  | {
      [key: string]: string
    }

interface ColorItemProps {
  title: string
  subtitle: string
  colors: Colors
}

function renderSwatch(color: string, index: number) {
  return (
    <div
      key={`${color}-${index}`}
      title={color}
      className="relative flex-1"
      style={{
        backgroundColor: color,
      }}
    />
  )
}

function renderSwatchLabel(color: string, index: number, colorDescription?: string) {
  return (
    <div
      key={`${color}-${index}`}
      title={color}
      className={cn([
        'flex-1 text-center font-mono text-xs leading-none overflow-hidden text-foreground/40 dark:text-foreground/60',
        '[&>div]:inline-block [&>div]:overflow-hidden [&>div]:max-w-full [&>div]:text-ellipsis',
        '[&_span]:block [&_span]:mt-0.5',
      ])}
    >
      <div>
        {color}
        {colorDescription && colorDescription !== color && <span>{colorDescription}</span>}
      </div>
    </div>
  )
}

function renderSwatchSpecimen(colors: Colors) {
  if (Array.isArray(colors)) {
    return (
      <div className="flex flex-col flex-1 relative mb-7.5">
        <div
          className={cn(
            'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
            'flex flex-row h-12.5 mb-2.5 overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding',
          )}
        >
          {colors.map((color, index) => renderSwatch(color, index))}
        </div>
        <div className="flex flex-row">
          {colors.map((color, index) => renderSwatchLabel(color, index))}
        </div>
      </div>
    )
  }

  const swatchElements = []
  const labelElements = []

  for (const colorKey in colors) {
    if (colorKey === 'DEFAULT') break

    const colorValue = colors[colorKey]
    swatchElements.push(renderSwatch(colorValue, swatchElements.length))
    labelElements.push(renderSwatchLabel(colorKey, labelElements.length, colorValue))
  }

  let primarySwatch = <Fragment />
  if ('DEFAULT' in colors) {
    const primaryColor = colors['DEFAULT']
    const primaryLabelColor = `rgb(from ${primaryColor} r g b / 0.1)`

    primarySwatch = (
      <div className="flex flex-row h-12.5 -mb-0.5 overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding rounded-b-none [&+.swatch-colors]:rounded-t-none">
        <div
          className="relative flex-1"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          <div
            className="absolute inset-0 flex justify-center items-center font-bold font-mono"
            style={{
              color: primaryLabelColor,
            }}
          >
            {primaryColor}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 relative mb-7.5">
      {primarySwatch}
      <div
        className={cn(
          'rounded-md border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_5px_rgba(0,0,0,0.20)]',
          'swatch-colors flex flex-row h-12.5 mb-2.5 overflow-hidden bg-white bg-[repeating-linear-gradient(-45deg,#ccc,#ccc_1px,#fff_1px,#fff_16px)] bg-clip-padding',
        )}
      >
        {swatchElements}
      </div>
      <div className="flex flex-row">{labelElements}</div>
    </div>
  )
}

/**
 * A single color row your styleguide showing title, subtitle and one or more colors, used as a
 * child of `ColorPalette`.
 */
export const ColorItem: FunctionComponent<ColorItemProps> = ({ title, subtitle, colors }) => {
  return (
    <div className="flex items-start">
      <div className="flex-[0_0_30%] leading-[20px] mt-[5px]">
        <div className="font-bold text-foreground">{title}</div>
        <div className="text-foreground/20 dark:text-foreground/60">{subtitle}</div>
      </div>
      <div className="flex-1 flex flex-row">{renderSwatchSpecimen(colors)}</div>
    </div>
  )
}

interface ColorPaletteProps {
  children?: React.ReactNode
}

/**
 * Styleguide documentation for colors, including names, captions, and color swatches, all specified
 * as `ColorItem` children of this wrapper component.
 */
export const ColorPalette: FunctionComponent<ColorPaletteProps> = ({ children, ...props }) => (
  <ResetWrapper>
    <div
      {...props}
      className="docblock-colorpalette sb-unstyled text-sm leading-[20px] flex flex-col"
    >
      <div className="flex flex-row items-center pb-[20px] font-bold text-foreground/40 dark:text-foreground/60">
        <div className="flex-[0_0_30%]">Name</div>
        <div className="flex-1">Swatches</div>
      </div>
      {children}
    </div>
  </ResetWrapper>
)

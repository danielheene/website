'use client'

import { JSONFieldClientProps } from 'payload'
import { FieldLabel, useField } from '@payloadcms/ui'
import styles from './ColorPaletteField.module.scss'
import { ColorPaletteSwatch } from './ColorPaletteSwatch'
import { useMemo } from 'react'
import { ColorPaletteSwatchValues, ColorPaletteSwatchVibrancy } from './ColorPaletteField.types'

interface ColorPaletteFieldProps extends JSONFieldClientProps {
  className?: string
}

const colorSwatchSortingOrder: ColorPaletteSwatchVibrancy[] = [
  'vibrant',
  'muted',
  'lightVibrant',
  'lightMuted',
  'darkVibrant',
  'darkVibrant',
]

export const ColorPaletteField = ({ path, className = '' }: ColorPaletteFieldProps) => {
  const { value = {} } = useField({ path })

  const sortedPalette = useMemo(
    () =>
      Object.entries(value || {}).sort(([a], [b]) => {
        const aPos = colorSwatchSortingOrder.indexOf(a as ColorPaletteSwatchVibrancy)
        const bPos = colorSwatchSortingOrder.indexOf(b as ColorPaletteSwatchVibrancy)

        if (aPos === -1 && bPos === -1) return 0
        if (aPos === -1) return 1
        if (bPos === -1) return -1
        return aPos - bPos
      }) as [ColorPaletteSwatchVibrancy, ColorPaletteSwatchValues][],
    [value],
  )

  return (
    <div className="field-type color-palette">
      <FieldLabel label="Color Palette" />
      <div className={`${styles.ColorPaletteField_Container} ${className}`}>
        {sortedPalette.map(([vibrancy, { background, foreground, name }]) => (
          <ColorPaletteSwatch key={vibrancy} vibrancy={vibrancy} background={background} foreground={foreground} name={name} />
        ))}
      </div>
    </div>
  )
}

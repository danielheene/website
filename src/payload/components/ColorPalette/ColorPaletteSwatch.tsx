'use client'

import { ColorPaletteSwatchVibrancy } from './ColorPaletteField.types'
import styles from './ColorPaletteSwatch.module.scss'
import { memo } from 'react'

interface ColorPaletteSwatchProps {
  name: string
  vibrancy: `${ColorPaletteSwatchVibrancy}`
  foreground: string
  background: string
}

export const ColorPaletteSwatch = memo(function ColorPaletteSwatch({ vibrancy, foreground, background, name }: ColorPaletteSwatchProps) {
  const capitalizedVibrancy = vibrancy.charAt(0).toUpperCase() + vibrancy.slice(1)

  return (
    <div className={styles.ColorPaletteSwatch_Container} style={{ backgroundColor: background, color: foreground }}>
      <span className={styles.ColorPaletteSwatch_Vibrancy}>{capitalizedVibrancy}</span>
      <span className={styles.ColorPaletteSwatch_Color}>{background}</span>
      <span className={styles.ColorPaletteSwatch_Name}>{name}</span>
    </div>
  )
})


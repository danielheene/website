export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

export type SwatchDetails = {
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  lab: { l: number; a: number; b: number }
  luminance: number
  luminanceWCAG: number
  bestContrast: 'white' | 'black'
  requestedHex: string
  distance: number
}

export type PaletteDetails = {
  colors: SwatchDetails[]
}

export type ColorPaletteSwatchVibrancy = 'vibrant' | 'muted' | 'darkMuted' | 'darkVibrant' | 'lightMuted' | 'lightVibrant'

export type ColorPaletteSwatchValues = {
  name: string
  distance: number
  luminance: number
  background: string
  foreground: string
  population: number
}

export type ColorPalette = Record<ColorPaletteSwatchVibrancy, ColorPaletteSwatchValues>

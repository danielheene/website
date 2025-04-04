import { type Config, ResumeCustomer } from '@payload-types'
import { Merge, SetNonNullable } from 'type-fest'
import { DataFromGlobalSlug } from 'payload'
import { Key } from 'react'

export type Global = keyof Config['globals']

export type GlobalData<S extends Global> = Merge<DataFromGlobalSlug<S>, { globalType: S }>

export type SectionData<S extends Global> = Omit<
  Merge<
    DataFromGlobalSlug<S>,
    {
      globalType: S
    }
  >,
  '_status' | 'createdAt' | 'updatedAt'
>

export type SectionProps<S extends Global> = Omit<
  Merge<
    DataFromGlobalSlug<S>,
    {
      globalType: S
      key?: Key
      className?: string
    }
  >,
  '_status' | 'createdAt' | 'updatedAt' | 'id'
>

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

export type CustomerEntry = SetNonNullable<Required<ResumeCustomer['entries'][number]>>

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

export type ColorPaletteSwatchVibrancy =
  | 'vibrant'
  | 'muted'
  | 'darkMuted'
  | 'darkVibrant'
  | 'lightMuted'
  | 'lightVibrant'

export type ColorPaletteSwatchValues = {
  name: string
  distance: number
  luminance: number
  background: string
  foreground: string
  population: number
}

export type ColorPalette = Record<ColorPaletteSwatchVibrancy, ColorPaletteSwatchValues>

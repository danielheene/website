export const FEATURE_CARD_SIZES = ['third', 'half', 'twoThirds', 'full'] as const

export type FeatureCardSize = (typeof FEATURE_CARD_SIZES)[number]

export const FEATURE_CARD_COLORS = [
  'primary',
  'secondary',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'info',
  'success',
  'warning',
  'error',
] as const

export type FeatureCardColor = (typeof FEATURE_CARD_COLORS)[number]

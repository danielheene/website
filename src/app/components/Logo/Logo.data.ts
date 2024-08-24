/**
 *
 */
export const LOGO_COLOR = {
  BRAND: 'brand',
  WHITE: 'white',
  BLACK: 'black',
} as const

export type LogoColor = (typeof LOGO_COLOR)[keyof typeof LOGO_COLOR]

export const LOGO_COLOR_VALUES = {
  [LOGO_COLOR.BLACK]: '0 0 0',
  [LOGO_COLOR.WHITE]: '255 255 255',
  [LOGO_COLOR.BRAND]: '29 39 242',
} satisfies Record<LogoColor, string>

/**
 *
 */
export const LOGO_VARIANT = {
  SINGLELINE: 'singleline',
  MULTILINE: 'multiline',
} as const

export type LogoVariant = (typeof LOGO_VARIANT)[keyof typeof LOGO_VARIANT]

export const LOGO_VARIANT_VALUES = {
  [LOGO_VARIANT.SINGLELINE]: ['daniel heene'],
  [LOGO_VARIANT.MULTILINE]: ['daniel', 'heene'],
} satisfies Record<LogoVariant, string[]>

/**
 *
 */
export const LOGO_SIZE = {
  SMALL: 'small',
  REGULAR: 'regular',
  LARGE: 'large',
} as const

export type LogoSize = (typeof LOGO_SIZE)[keyof typeof LOGO_SIZE]

export const LOGO_SIZE_VALUES = {
  [LOGO_SIZE.SMALL]: 36,
  [LOGO_SIZE.REGULAR]: 54,
  [LOGO_SIZE.LARGE]: 72,
} satisfies Record<LogoSize, number>

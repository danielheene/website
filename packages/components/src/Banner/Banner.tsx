import React, { JSX } from 'react'

import { tv, VariantProps } from 'tailwind-variants'

import { Icon } from '../Icon'

export const BannerVariant = {
  Neutral: 'neutral',
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
  Error: 'error',
} as const

export const BannerIconNameMap: Record<BannerProps['variant'], string> = {
  [BannerVariant.Neutral]: 'material-symbols:arrow-forward',
  [BannerVariant.Info]: 'material-symbols:info',
  [BannerVariant.Warning]: 'material-symbols:warning',
  [BannerVariant.Success]: 'material-symbols:check-circle',
  [BannerVariant.Error]: 'material-symbols:error',
} as const

export const bannerStyles = tv({
  base: [
    'relative block py-4 pr-4 pl-16',
    'font-pp-supply-mono font-medium',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:text-[2rem] [&>svg]:leading-[2rem]',
  ],
  variants: {
    variant: {
      [BannerVariant.Neutral]: ['[--banner-color:var(--color-neutral-700)]'],
      [BannerVariant.Info]: ['[--banner-color:var(--color-info-600)]'],
      [BannerVariant.Success]: ['[--banner-color:var(--color-success-600)]'],
      [BannerVariant.Warning]: ['[--banner-color:var(--color-warning-700)]'],
      [BannerVariant.Error]: ['[--banner-color:var(--color-error-700)]'],
    },
    inverse: {
      false: ['bg-(--banner-color)', 'text-white'],
      true: ['bg-white', 'text-(--banner-color)'],
    },
    vAlignIcon: {
      true: ['[&>svg]:top-1/2 [&>svg]:translate-y-[-50%]'],
      false: ['[&>svg]:top-4'],
    },
    rotateIcon: {
      true: ['[&>svg]:animate-spin'],
      false: [],
    },
  },
  defaultVariants: {
    inverse: false,
    vAlignIcon: false,
    rotateIcon: false,
  },
})

interface BannerProps extends VariantProps<typeof bannerStyles> {
  className?: string
  customIcon?: string
  children?: React.ReactNode
}

export const Banner = ({
  className,
  customIcon = '',
  vAlignIcon,
  rotateIcon,
  children,
  variant = BannerVariant.Neutral,
  inverse = false,
}: BannerProps): JSX.Element => (
  <div
    className={bannerStyles({
      variant,
      inverse,
      vAlignIcon,
      rotateIcon,
      class: className,
    })}
  >
    <Icon name={customIcon || BannerIconNameMap[variant]} />
    <div className="py-1 font-mono font-semibold tracking-wide">{children}</div>
  </div>
)

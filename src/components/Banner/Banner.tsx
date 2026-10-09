import React, { JSX } from 'react'

import { cn, tv, VariantProps } from 'tailwind-variants'

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
    'block py-4 pl-16 pr-4 relative',
    'font-medium font-pp-supply-mono',
    '[&>svg]:text-[2rem] [&>svg]:leading-[2rem] [&>svg]:absolute [&>svg]:left-4',
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
      false: ['bg-(--banner-color)', 'text-(--color-white)'],
      true: ['bg-(--color-white)', 'text-(--banner-color)'],
    },
    vAlignIcon: {
      true: ['[&>svg]:top-1/2 [&>svg]:translate-y-[-50%]'],
      false: ['[&>svg]:top-4 '],
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
    <div className="py-1 font-semibold font-mono -tracking-tight">{children}</div>
  </div>
)

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
  base: cn([
    'block py-4 pl-16 pr-4 relative',
    'font-medium font-pp-supply-mono',
  ]),
  variants: {
    variant: {
      [BannerVariant.Neutral]: cn([
        '[--banner-color:var(--color-neutral-700)]',
      ]),
      [BannerVariant.Info]: cn([
        '[--banner-color:var(--color-info-600)]',
      ]),
      [BannerVariant.Success]: cn([
        '[--banner-color:var(--color-success-600)]',
      ]),
      [BannerVariant.Warning]: cn([
        '[--banner-color:var(--color-warning-700)]',
      ]),
      [BannerVariant.Error]: cn([
        '[--banner-color:var(--color-error-700)]',
      ]),
    },
    inverse: {
      false: cn([
        'bg-(--banner-color)',
        'text-(--color-white)',
      ]),
      true: cn([
        'bg-(--color-white)',
        'text-(--banner-color)',
      ]),
    },
  },
  defaultVariants: {
    inverse: false,
  },
})

interface BannerProps extends VariantProps<typeof bannerStyles> {
  className?: string
  customIcon?: string
  rotateIcon?: boolean
  children?: React.ReactNode
}

export const Banner = ({
  className,
  customIcon = '',
  rotateIcon = false,
  children,
  variant = BannerVariant.Neutral,
  inverse = false,
}: BannerProps): JSX.Element => (
  <div
    className={bannerStyles({
      variant,
      inverse,
      class: className,
    })}
  >
    <Icon
      name={customIcon || BannerIconNameMap[variant]}
      className={cn([
        'text-[2rem] leading-[2rem] absolute top-4 left-4',
        rotateIcon && 'animate-spin',
      ])}
    />
    <div className="py-1 font-semibold font-mono -tracking-tight">{children}</div>
  </div>
)

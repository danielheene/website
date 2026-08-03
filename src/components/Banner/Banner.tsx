import React, { JSX } from 'react'

import { tv, VariantProps } from 'tailwind-variants'

import { Icon } from '@/components/Icon'

export const BannerVariant = {
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
  Error: 'error',
} as const

export const BannerIconNameMap: Record<BannerProps['variant'], string> = {
  [BannerVariant.Info]: 'material-symbols:info',
  [BannerVariant.Warning]: 'material-symbols:warning',
  [BannerVariant.Success]: 'material-symbols:check',
  [BannerVariant.Error]: 'material-symbols:error',
} as const

export const bannerStyles = tv({
  base: 'border-2 p-4 flex items-start gap-4 rounded',
  variants: {
    variant: {
      [BannerVariant.Info]: 'border-info/75 bg-info/20 text-info-900 dark:text-info-100',
      [BannerVariant.Warning]:
        'border-warning/50 bg-[color-mix(in_oklch,_var(--color-warning-400)_20%,_var(--color-background))] text-warning-700 dark:text-warning-100)  ',
      [BannerVariant.Success]:
        'border-success/75 bg-success/20 text-success-900 dark:text-success-100',
      [BannerVariant.Error]: 'border-error/75 bg-error/20 text-error-900 dark:text-error-100',
    },
  },
})

interface BannerProps extends VariantProps<typeof bannerStyles> {
  className?: string
  children?: React.ReactNode
}

export const Banner = ({ className, children, variant }: BannerProps): JSX.Element => (
  <div
    className={bannerStyles({
      variant,
      class: className,
    })}
  >
    <Icon name={BannerIconNameMap[variant]} className="text-2xl" />
    <div>{children}</div>
  </div>
)

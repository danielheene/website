import React, { JSX } from 'react'

import { cn, tv, VariantProps } from 'tailwind-variants'

import { Icon } from '../Icon'

export const BannerVariant = {
  Info: 'info',
  Warning: 'warning',
  Success: 'success',
  Error: 'error',
} as const

export const BannerIconNameMap: Record<BannerProps['variant'], string> = {
  [BannerVariant.Info]: 'material-symbols:info',
  [BannerVariant.Warning]: 'material-symbols:warning',
  [BannerVariant.Success]: 'material-symbols:check-circle',
  [BannerVariant.Error]: 'material-symbols:error',
} as const

export const bannerStyles = tv({
  base: cn([
    'p-4 flex items-start gap-4 border-2',

    'border-(--badge-color)',
    'bg-(--badge-color)',
    'text-(--color-white)',
  ]),
  variants: {
    variant: {
      [BannerVariant.Info]: cn([
        '[--badge-color:var(--color-info-600)]',
        'dark:[--badge-color:var(--color-info-400)]',
      ]),
      [BannerVariant.Warning]: cn([
        '[--badge-color:var(--color-warning-600)]',
        'dark:[--badge-color:var(--color-warning-500)]',
      ]),
      [BannerVariant.Success]: cn([
        '[--badge-color:var(--color-success-600)]',
        'dark:[--badge-color:var(--color-success-400)]',
      ]),
      [BannerVariant.Error]: cn([
        '[--badge-color:var(--color-error-600)]',
        'dark:[--badge-color:var(--color-error-400)]',
      ]),
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
    <Icon name={BannerIconNameMap[variant]} className="text-3xl grow-0 shrink-0" />
    <div>{children}</div>
  </div>
)

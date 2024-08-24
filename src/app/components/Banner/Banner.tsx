import { cn } from '@/utilities/cn'
import React, { JSX } from 'react'
import { Icon } from '@/components/Icon'

export const BANNER_VARIANT = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const

export type BannerVariant = `${(typeof BANNER_VARIANT)[keyof typeof BANNER_VARIANT]}`

interface BannerProps {
  className?: string
  children?: React.ReactNode
  variant: BannerVariant
}

export const Banner = ({
  className,
  children,
  variant = BANNER_VARIANT.INFO,
}: BannerProps): JSX.Element => (
  <div
    className={cn([
      'border-2 p-4 flex items-start gap-4 rounded',
      {
        'border-info/75 bg-info/20 text-info-900': variant === BANNER_VARIANT.INFO,
        'border-error/75 bg-error/20 text-error-900': variant === BANNER_VARIANT.ERROR,
        'border-success/75 bg-success/20 text-success-900': variant === BANNER_VARIANT.SUCCESS,
        'border-warning/75 bg-warning/20 text-warning-900': variant === BANNER_VARIANT.WARNING,
      },
      className,
    ])}
  >
    <Icon name={variant} className="text-2xl" />
    <div>{children}</div>
  </div>
)

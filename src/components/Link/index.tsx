import type React from 'react'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import { generateContentURL } from '@/lib/generateContentURL'
import type { LinkFieldData } from '@/types/payload'

type CMSLinkType = LinkFieldData & {
  appearance?: 'inline'
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    icon,
    iconOnly,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    variant,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? generateContentURL({
          collection: reference?.relationTo,
          slug: reference.value.slug,
        })
      : url

  if (!href) return null

  const size = appearance === 'inline' ? 'clear' : sizeFromProps

  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  return (
    <Button
      className={cn(className)}
      size={sizeFromProps}
      variant={variant}
      type="link"
      {...(icon && iconOnly
        ? {
            'aria-label': label,
          }
        : {})}
      href={href || url}
      {...newTabProps}
    >
      {icon && <Icon name={icon} />}
      {((icon && !iconOnly) || !icon) && label && <span>{label}</span>}
      {((icon && !iconOnly) || !icon) && children && children}
    </Button>
  )
}

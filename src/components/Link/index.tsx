import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/cn'
import { generateContentURL } from '@/lib/generateContentURL'
import type { LinkFieldData } from '@/types/payload'

type CMSLinkType = LinkFieldData & {
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    icon,
    iconOnly,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    variant = 'link',
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

  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  return (
    <Button
      className={className}
      size={sizeFromProps}
      variant={variant}
      {...(icon && iconOnly
        ? {
            'aria-label': label,
          }
        : {})}
      asChild
    >
      <Link href={href || url} {...newTabProps}>
        {icon && <Icon name={icon} />}
        {((icon && !iconOnly) || !icon) && label && <span>{label}</span>}
        {((icon && !iconOnly) || !icon) && children && children}
      </Link>
    </Button>
  )
}

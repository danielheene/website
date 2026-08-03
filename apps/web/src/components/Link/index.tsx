import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@repo/ui/Button'
import { Icon } from '@repo/ui/Icon'
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
    size,
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
      size={size}
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

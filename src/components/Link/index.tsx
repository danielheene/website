import type { LinkFieldData } from '@payload-types'
import Link from 'next/link'
import type React from 'react'

import { Button, type ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { cn } from '@/utilities/cn'
import { generateContentPath } from '@/utilities/generateContentURL'

type CMSLinkType = LinkFieldData & {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: ButtonProps['size']
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    icon,
    iconOnly,
    cc,
    subject,
    address,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? generateContentPath(reference?.relationTo, reference.value.slug)
      : type === 'mailto'
        ? `mailto:${address}?subject=${subject || ''}&cc=${cc || ''}`
        : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  const link = (
    <Link className={cn(className)} href={href || url} {...newTabProps} {...(icon && iconOnly ? { 'aria-label': label } : {})}>
      {icon && <Icon icon={icon} />}
      {((icon && !iconOnly) || !icon) && label && <span>{label}</span>}
      {((icon && !iconOnly) || !icon) && children && children}
    </Link>
  )

  return appearance === 'inline' ? (
    link
  ) : (
    <Button asChild className={className} size={size} variant={appearance}>
      {link}
    </Button>
  )
}

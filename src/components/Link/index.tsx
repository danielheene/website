import type React from 'react'

import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { generateContentPath } from '@/lib/generateContentPath'
import type { LinkFieldData } from '@/types/payload'

type CMSLinkType = LinkFieldData & {
  appearance?: 'inline' | string
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: string
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    icon,
    iconOnly,
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
    type === 'reference' &&
    typeof reference?.value === 'object' &&
    reference.value.slug
      ? generateContentPath(reference?.relationTo, reference.value.slug)
      : type === 'mailto'
        ? `mailto:${address}`
        : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  return (
    <Button
      className={cn(className)}
      href={href || url}
      {...newTabProps}
      {...(icon && iconOnly
        ? {
            'aria-label': label,
          }
        : {})}
    >
      {icon && <Icon name={icon} />}
      {((icon && !iconOnly) || !icon) && label && <span>{label}</span>}
      {((icon && !iconOnly) || !icon) && children && children}
    </Button>
  )
}

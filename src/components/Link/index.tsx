import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { generateContentURL } from '@/lib/generateContentURL'

type CMSLinkType = LinkFieldDataLean & {
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    children,
    className,
    iconAfter,
    iconBefore,
    iconOnly,
    label,
    newTab,
    size,
    variant = 'link',
  } = props

  const target = resolveLinkTarget(props)

  if (!target) return null

  const href =
    target.relationTo === CUSTOM_URL_SLUG
      ? target.value
      : typeof target.value === 'object' && target.value.slug
        ? generateContentURL({
            collection: target.relationTo,
            slug: target.value.slug,
          })
        : null

  if (!href) return null

  const text = label

  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  const hasIcon = Boolean(iconBefore || iconAfter)
  const showText = !(hasIcon && iconOnly)

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      {...(hasIcon && iconOnly
        ? {
            'aria-label': text,
          }
        : {})}
      asChild
    >
      <Link href={href} {...newTabProps}>
        {iconBefore && <Icon name={iconBefore} />}
        {showText && text && <span>{text}</span>}
        {showText && children}
        {iconAfter && <Icon name={iconAfter} />}
      </Link>
    </Button>
  )
}

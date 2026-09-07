import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { generateContentURL } from '@/lib/generateContentURL'

type CMSLinkType = LinkFieldDataLean & {
  /**
   * Rendered inline content for the link — used by the RichText `link`
   * converter (`serialize.tsx`) to pass through the selection's actual
   * serialized Lexical children (which may carry bold/italic/etc., not just
   * plain text) instead of the field's own `text` label.
   */
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
    text,
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

  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  const hasIcon = Boolean(iconBefore || iconAfter)
  const content = children ?? text

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      startIcon={!iconOnly && iconBefore ? iconBefore : undefined}
      endIcon={!iconOnly && iconAfter ? iconAfter : undefined}
      {...(hasIcon && iconOnly
        ? {
            'aria-label': text,
          }
        : {})}
      asChild
    >
      <Link href={href} {...newTabProps}>
        {iconOnly ? iconBefore && <Icon name={iconBefore} /> : content}
      </Link>
    </Button>
  )
}

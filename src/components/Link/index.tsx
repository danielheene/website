import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { resolveLinkProps } from '@/fields/Link/lib/resolveLinkProps'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'

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
    size,
    variant = 'link',
  } = props

  const linkProps = resolveLinkProps(props)
  if (!linkProps) return null

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
      <Link {...linkProps}>{iconOnly ? iconBefore && <Icon name={iconBefore} /> : content}</Link>
    </Button>
  )
}

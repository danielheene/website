import React, { JSX } from 'react'
import Link from 'next/link'

import { cn } from 'tailwind-variants'

import { Button, ButtonProps } from '@/components/Button'
import { resolveLinkProps } from '@/fields/Link/lib/resolveLinkProps'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'

export interface CMSLinkProps extends LinkFieldDataLean {
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

export const CMSLink = (props: CMSLinkProps): JSX.Element => {
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

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      startIcon={iconBefore ? iconBefore : undefined}
      endIcon={!iconOnly && iconAfter ? iconAfter : undefined}
      asChild
    >
      <Link {...linkProps}>
        <span className={cn([iconOnly && 'sr-only'])}>{children ?? text}</span>
      </Link>
    </Button>
  )
}

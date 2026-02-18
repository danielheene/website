'use client'

import type React from 'react'
import type { ElementType } from 'react'

import './index.scss'

import { Button } from '@payloadcms/ui'

export type Props = {
  actions?: React.ReactNode
  buttonAriaLabel?: string
  href?: string
  id?: string
  Link?: ElementType
  onClickAction?: () => void
  title: string
  titleAs?: ElementType
  count?: number
}

const baseClass = 'feature-card'

export const FeatureCard: React.FC<Props> = (props) => {
  const { id, actions, buttonAriaLabel, href, Link, onClickAction, title, titleAs, count } = props

  const classes = [baseClass, id, (onClickAction || href) && `${baseClass}--has-onclick`].filter(Boolean).join(' ')

  const Tag = titleAs ?? 'div'

  return (
    <div className={classes} id={id}>
      <Tag className={`${baseClass}__title`}>{title}</Tag>
      {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
      {(onClickAction || href) && (
        <Button
          aria-label={buttonAriaLabel}
          buttonStyle="none"
          className={`${baseClass}__click`}
          el="link"
          Link={Link}
          onClick={onClickAction}
          to={href}
        />
      )}

      <h2 className={`${baseClass}__count`}>{count ?? 0}</h2>
    </div>
  )
}

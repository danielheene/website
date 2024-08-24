'use client'

import React, { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react'
import { ImCross } from 'react-icons/im'
import styles from './TagItem.module.scss'

interface TagItemProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  id: string
  children: string
  // onKeyDownAction: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  onDeleteAction: (id: string) => void
}

export const TagItem = forwardRef<HTMLButtonElement, TagItemProps>(
  ({ id, children, onDeleteAction, ...buttonProps }, ref) => (
    <button
      ref={ref}
      className={styles.TagItem}
      data-tag-id={id}
      onClick={(e) => e.preventDefault()}
      onAnimationEnd={(e) => e.currentTarget.classList.remove('pulsate')}
      {...buttonProps}
    >
      <span className={styles.TagItem_Value}>{children}</span>
      <span className={styles.TagItem_Remove} onClick={() => onDeleteAction(id)} aria-hidden>
        <ImCross className={styles.TagItem_Icon} />
      </span>
    </button>
  ),
)

TagItem.displayName = 'TagItem'

'use client'

import React, { DetailedHTMLProps, HTMLAttributes } from 'react'
import styles from './TagItem.module.scss'

interface TagItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  id: string
  children: string
  onDeleteAction: (id: string) => void
}

export const TagItem = ({ id, ref, children, onDeleteAction, ...buttonProps }: TagItemProps) => (
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
        />
      </svg>
    </span>
  </button>
)

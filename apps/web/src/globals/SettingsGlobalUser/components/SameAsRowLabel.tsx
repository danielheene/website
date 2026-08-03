'use client'

import { useRowLabel } from '@payloadcms/ui'

import { Icon } from '@repo/ui/Icon'
import type { GlobalUserSettings } from '@/types/payload'

import styles from './SharedRowLabel.module.css'

type RowLabelData = GlobalUserSettings['sameAs'][number]

export const SameAsRowLabel = () => {
  const { data: { icon, name, url } = {} } = useRowLabel<RowLabelData>()

  return (
    <div className={styles.Root}>
      <span className={styles.Icon}>{icon && <Icon name={icon} />}</span>
      {name && <span className={styles.Name}>{name}</span>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.Note}>
          [{url}]
        </a>
      )}
    </div>
  )
}

export default SameAsRowLabel

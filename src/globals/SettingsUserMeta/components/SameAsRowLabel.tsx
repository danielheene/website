'use client'

import type { UserMetaData } from '@payload-types'
import { useRowLabel } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'

import styles from './SameAsRowLabel.module.css'

type RowLabelData = UserMetaData['sameAs'][number]

export const SameAsRowLabel = () => {
  const { data: { icon, name, url } = {} } = useRowLabel<RowLabelData>()
  console.log('icon', icon)

  return (
    <div className={styles.Root}>
      <span className={styles.Icon}>{icon && <Icon icon={icon} />}</span>
      {name && <span className={styles.Name}>{name}</span>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.URL}>
          [{url}]
        </a>
      )}
    </div>
  )
}

export default SameAsRowLabel

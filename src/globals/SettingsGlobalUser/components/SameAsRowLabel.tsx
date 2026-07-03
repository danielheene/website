'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { RowFieldLabelClientComponent } from 'payload'

import { Icon } from '@/components/Icon'
import type { UserConfigurationData } from '@/types/payload'

import styles from './SharedRowLabel.module.css'

type RowLabelData = UserConfigurationData['sameAs'][number]

export const SameAsRowLabel: RowFieldLabelClientComponent = () => {
  const { data: { icon, name, url } = {} } = useRowLabel<RowLabelData>()

  return (
    <div className={styles.Root}>
      <span className={styles.Icon}>{icon && <Icon name={icon} />}</span>
      {name && <span className={styles.Name}>{name}</span>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.Note}
        >
          [{url}]
        </a>
      )}
    </div>
  )
}

export default SameAsRowLabel

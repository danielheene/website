'use client'

import { useRowLabel } from '@payloadcms/ui'

import { translate } from '@/lib/i18n'
import type { GlobalUserSettings } from '@/types/payload'

import styles from './SharedRowLabel.module.css'

type RowLabelData = GlobalUserSettings['languages'][number]

export const LanguagesRowLabel = () => {
  const { data: { language, proficiency } = {} } = useRowLabel<RowLabelData>()

  return (
    <div className={styles.Root}>
      {language && (
        <span className={styles.Name}>{translate('en', `language.name.${language}`)}</span>
      )}
      {proficiency && (
        <span className={styles.Note}>
          [{translate('en', `language.proficiency.${proficiency}`)}]
        </span>
      )}
    </div>
  )
}

export default LanguagesRowLabel

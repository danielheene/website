'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { RowFieldLabelClientComponent } from 'payload'

import { translate } from '@/lib/i18n'
import type { UserConfigurationData } from '@/types/payload'

import styles from './SharedRowLabel.module.css'

type RowLabelData = UserConfigurationData['languages'][number]

export const LanguagesRowLabel: RowFieldLabelClientComponent = () => {
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

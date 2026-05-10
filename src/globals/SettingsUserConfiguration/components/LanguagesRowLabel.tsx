'use client'

import { useRowLabel } from '@payloadcms/ui'
import type { RowFieldLabelClientComponent } from 'payload'

import { getLanguageName } from '@/lib/languageNames'
import { getLanguageProficiencyLabel } from '@/lib/languageProficiency'
import type { UserConfigurationData } from '@/types/payload'

import styles from './SharedRowLabel.module.css'

type RowLabelData = UserConfigurationData['languages'][number]

export const LanguagesRowLabel: RowFieldLabelClientComponent = () => {
  const { data: { language, proficiency } = {} } = useRowLabel<RowLabelData>()

  return (
    <div className={styles.Root}>
      {language && (
        <span className={styles.Name}>{getLanguageName(language)}</span>
      )}
      {proficiency && (
        <span className={styles.Note}>
          [{proficiency}: {getLanguageProficiencyLabel(proficiency)}]
        </span>
      )}
    </div>
  )
}

export default LanguagesRowLabel

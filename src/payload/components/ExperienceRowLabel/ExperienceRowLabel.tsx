'use client'

import { useRowLabel } from '@payloadcms/ui'
import styles from './ExperienceRowLabel.module.scss'
import { useExperienceTimeSpan } from '@/utilities/useExperienceTimeSpan'

type ExperienceRowLabelData = {
  title: string
  employer: string
  startDate: string
  endDate?: string
}

export const ExperienceRowLabel = () => {
  const { data: { title, employer, startDate, endDate } = {} } =
    useRowLabel<ExperienceRowLabelData>()

  const timeString = useExperienceTimeSpan(startDate, endDate)

  return (
    <div className={styles.ExperienceRowLabel_Container}>
      {!!title && <span className={styles.ExperienceRowLabel_Title}>{title}</span>}
      {!!employer && (
        <span className={styles.ExperienceRowLabel_Title}>&nbsp;@&nbsp;{employer}</span>
      )}
      {!!timeString && <span className={styles.ExperienceRowLabel}>[{timeString}]</span>}
    </div>
  )
}

'use client'

import { useRowLabel } from '@payloadcms/ui'
import styles from './RowLabel.module.scss'
import { useExperienceTimeSpan } from '@/utilities/useExperienceTimeSpan'

type RowLabelData = {
  title: string
  employer: string
  startDate: string
  endDate?: string
}

const RowLabel = () => {
  const { data: { title, employer, startDate, endDate } = {} } = useRowLabel<RowLabelData>()
  const timeString = useExperienceTimeSpan(startDate, endDate)

  return (
    <div className={styles.RowLabel_Container}>
      {!!title && <span className={styles.RowLabel_Title}>{title}</span>}
      {!!employer && <span className={styles.RowLabel_Title}>&nbsp;@&nbsp;{employer}</span>}
      {!!timeString && <span className={styles.RowLabel_DateLabel}>[{timeString}]</span>}
    </div>
  )
}

export default RowLabel

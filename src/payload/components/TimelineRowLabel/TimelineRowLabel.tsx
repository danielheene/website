'use client'

import { useRowLabel } from '@payloadcms/ui'
import dayjs from 'dayjs'

import styles from './TimelineRowLabel.module.scss'

export const TimelineRowLabel = () => {
  const { data: { title, employer, startDate, endDate } = {} } = useRowLabel<{
    title: string
    employer: string
    startDate: string
    endDate: string
  }>()

  const startString = startDate ? dayjs(startDate).format('MM/YYYY') : null
  const endString = endDate ? dayjs(endDate).format('MM/YYYY') : null

  return (
    <div className={styles.TimelineRowLabel_Container}>
      {!!startString && !!endString && (
        <span className={styles.TimelineRowLabel_DateLabel}>
          [{startString} - {endString}]
        </span>
      )}
      <span className={styles.TimelineRowLabel_Title}>
        {title}
        <span className="opacity-40 text-sm font-semibold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;{employer}</span>
      </span>
    </div>
  )
}

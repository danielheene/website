'use client'

import { ProjectList } from '@payload-types'
import { useRowLabel } from '@payloadcms/ui'
import styles from './RowLabel.module.scss'

type RowLabelData = ProjectList[number]

const RowLabel = () => {
  const { data: { preHeading, heading } = {} } = useRowLabel<RowLabelData>()

  return preHeading || heading ? (
    <div className={styles.Root}>
      {preHeading && <span className={styles.PreHeading}>{preHeading}</span>}
      {preHeading && heading && <span className={styles.Separator}>:&nbsp;</span>}
      {heading && <span className={styles.Heading}>{heading}</span>}
    </div>
  ) : null
}

export default RowLabel

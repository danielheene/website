'use client'

import { ChangeEvent, useEffect, useRef } from 'react'
import { TextInput, toast, useField, useRowLabel } from '@payloadcms/ui'

import styles from './RowLabel.module.css'

const RowLabel = () => {
  const prevError = useRef<string>('')
  const { path: rowPath } = useRowLabel()
  const { value, initialValue, setValue, path, errorMessage, showError } = useField<string>({ path: `${rowPath}.name` })

  useEffect(() => {
    if (showError && errorMessage !== prevError.current) {
      toast.error(errorMessage)
    }
    prevError.current = errorMessage
  }, [showError, errorMessage])

  return (
    <TextInput
      path={path}
      placeholder="Name"
      value={value || initialValue || ''}
      showError={showError}
      onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
      className={styles.RowLabel}
    />
  )
}

export default RowLabel

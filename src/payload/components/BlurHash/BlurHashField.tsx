'use client'

import { TextFieldClientProps } from 'payload'
import { FieldLabel, useField } from '@payloadcms/ui'
import styles from './BlurHashField.module.scss'
import { Blurhash } from 'react-blurhash'

interface BlurHashFieldProps extends TextFieldClientProps {
  className?: string
}

export const BlurHashField = ({ path, className = '' }: BlurHashFieldProps) => {
  const { value = '' }: { value: string } = useField({ path })

  return (
    <div className="field-type blur-hash">
      <FieldLabel label="Blur Hash" />
      <Blurhash
        className={`${styles.BlurHashField_Container} ${className}`}
        hash={value}
        width={null}
        height={null}
      />
    </div>
  )
}

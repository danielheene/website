'use client'

import type React from 'react'
import type { TextFieldClientProps } from 'payload'
import { useForm } from '@payloadcms/ui'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { generateSlug } from '@/lib/generateSlug'

type FieldComponentProps = {
  fieldToUse: string
} & TextFieldClientProps

const FieldComponent: React.FC<FieldComponentProps> = ({ fieldToUse, ...fieldProps }) => {
  const { getDataByPath } = useForm()

  const generateValue = () => {
    const data = getDataByPath<string>(fieldToUse)
    if (data) return generateSlug(data)
  }

  return (
    <TextFieldWithLockAndGenerate
      hasLock={true}
      hasGenerate={true}
      generateFunction={generateValue}
      {...fieldProps}
    />
  )
}

export default FieldComponent

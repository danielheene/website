'use client'

import type React from 'react'
import type { TextFieldClientProps } from 'payload'
import { useForm } from '@payloadcms/ui'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { generateSlug } from '@/lib/generateSlug'

type FieldComponentProps = {
  fieldToUse: string
} & TextFieldClientProps

const FieldComponent: React.FC<FieldComponentProps> = ({ fieldToUse, path, field }) => {
  const { getDataByPath } = useForm()

  const generateValue = async () => {
    const data = getDataByPath<string>(fieldToUse)
    if (data) return generateSlug(data)
  }

  return (
    <TextFieldWithLockAndGenerate
      hasLock={true}
      hasGenerate={true}
      generateFunction={generateValue}
      field={field}
      path={path}
    />
  )
}

export default FieldComponent

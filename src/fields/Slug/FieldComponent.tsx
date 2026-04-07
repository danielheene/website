'use client'

import { useForm } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import type React from 'react'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { generateSlug } from '@/lib/generateSlug'

type SlugComponentProps = {
  fieldToUse: string
} & TextFieldClientProps

const FieldComponent: React.FC<SlugComponentProps> = ({ fieldToUse, ...fieldProps }) => {
  const { getDataByPath } = useForm()

  const generateValue = async () => {
    const data = getDataByPath<string>(fieldToUse)
    if (data) return generateSlug(data)
  }

  return <TextFieldWithLockAndGenerate hasLock={true} hasGenerate={true} generateFunction={generateValue} {...fieldProps} />
}

export default FieldComponent

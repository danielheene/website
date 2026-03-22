'use client'

import type { TextFieldClientProps } from 'payload'
import React, { useCallback } from 'react'

import { generateSlug } from '@/lib/generateSlug'

import { TextFieldWithLockAndGenerate } from '@/components/AdminPanel/TextFieldWithLockAndGenerate'
import { useForm } from '@payloadcms/ui'

type SlugComponentProps = {
  fieldToUse: string
} & TextFieldClientProps

const FieldComponent: React.FC<SlugComponentProps> = ({ fieldToUse, ...fieldProps }) => {

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
      {...fieldProps}
    />
  )
}

export default FieldComponent

'use client'

import {
  TextFieldWithLockAndGenerate,
  type TextFieldWithLockAndGenerateProps,
} from '@/components/AdminPanel/TextFieldWithLockAndGenerate'

type FieldComponentClientProps = {} & TextFieldWithLockAndGenerateProps

export const FieldComponentClient = (props: FieldComponentClientProps) => {
  return <TextFieldWithLockAndGenerate {...props} />
}

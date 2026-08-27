'use client'

import { useEffect, useRef } from 'react'
import type { TextFieldClientProps } from 'payload'
import { TextField, useField } from '@payloadcms/ui'

import { generateMetaTitle } from '@/lib/generateMetaTitle'

type FieldComponentClientProps = {
  titlePath: string
} & TextFieldClientProps

export const FieldComponentClient = ({ path, field, titlePath }: FieldComponentClientProps) => {
  const prevTitle = useRef<string>(null)
  const { value: title } = useField<string>({
    path: titlePath,
  })

  const { setValue } = useField<string>({
    path,
  })

  useEffect(() => {
    if (!title || title === prevTitle.current) return

    Promise.resolve(generateMetaTitle(title)).then((nextValue) => {
      setValue(nextValue)
      prevTitle.current = title
    })
  }, [
    title,
    setValue,
  ])

  return <TextField path={path} field={field} />
}

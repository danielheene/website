'use client'

import { useDocumentInfo, useField, useForm, useLivePreviewContext } from '@payloadcms/ui'
import { GroupFieldClientProps } from 'payload'

export const FieldComponent = (props: GroupFieldClientProps) => {
  console.log(props)
  const { value } = useField({ path: props.path })
  const { getDataByPath } = useForm()
  console.log(value, getDataByPath(props.path))
  console.log(useDocumentInfo())
  console.log(useLivePreviewContext())
  return <div>Meta Field</div>
}

export default FieldComponent

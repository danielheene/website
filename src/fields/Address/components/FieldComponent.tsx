'use client'

import { GroupField } from '@payloadcms/ui'
import type { GroupFieldClientComponent, NamedGroupFieldClient, UnnamedGroupFieldClient } from 'payload'
import { useEffect, useRef, useState } from 'react'

import { eventName, generateFieldId, type Locale } from './_shared'

export const FieldComponent: GroupFieldClientComponent = (props) => {
  const { field, path, renderedBlocks, forceRender, schemaPath, permissions, parentPath, parentSchemaPath, indexPath, readOnly } = props
  const [currentLocale, setCurrentLocale] = useState<Locale>()

  const fieldId = generateFieldId(path)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (rootRef.current) return
    rootRef.current = document.getElementById(fieldId)
    rootRef.current.addEventListener(eventName, (event: CustomEvent) => {
      setCurrentLocale(event.detail.locale)
    })
  }, [fieldId])

  const modifiedField = {
    ...field,
    fields: field.fields.map((field) => ({
      ...field,
      admin: {
        ...field.admin,
        hidden: 'name' in field && field.name !== currentLocale,
      },
    })),
  } as
    | (Omit<UnnamedGroupFieldClient, 'type'> & Partial<Pick<UnnamedGroupFieldClient, 'type'>>)
    | (Omit<NamedGroupFieldClient, 'type'> & Partial<Pick<NamedGroupFieldClient, 'type'>>)

  return (
    <GroupField
      field={modifiedField}
      path={path}
      indexPath={indexPath}
      readOnly={readOnly}
      renderedBlocks={renderedBlocks}
      schemaPath={schemaPath}
      parentPath={parentPath}
      parentSchemaPath={parentSchemaPath}
      permissions={permissions}
      forceRender={forceRender}
    />
  )
}

export default FieldComponent

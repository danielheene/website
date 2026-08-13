'use client'

import type { JSX } from 'react'
import type { RelationshipFieldClientProps } from 'payload'
import { useField } from '@payloadcms/ui'

export const TargetFieldClient = ({ path }: RelationshipFieldClientProps): JSX.Element => {
  const { value } = useField<unknown>({
    path,
  })

  return (
    <div className="field-type" data-testid="link-target-field">
      <p>TargetField mounted at path: {path}</p>
      <pre>{JSON.stringify(value ?? null)}</pre>
    </div>
  )
}

export default TargetFieldClient

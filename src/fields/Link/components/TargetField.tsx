import type { RelationshipFieldServerComponent, RelationshipFieldServerProps } from 'payload'

import { fetchLinkTargetOptions } from '@/fields/Link/lib/fetchLinkTargetOptions'

import TargetFieldClient from './TargetField.client'

export const TargetField: RelationshipFieldServerComponent = async (
  props: RelationshipFieldServerProps,
) => {
  const { clientField, path, readOnly, req } = props

  const optionGroups = await fetchLinkTargetOptions(req)

  return (
    <TargetFieldClient
      field={clientField}
      optionGroups={optionGroups}
      path={path}
      readOnly={readOnly}
    />
  )
}

export default TargetField

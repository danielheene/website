import type { RelationshipFieldServerComponent, RelationshipFieldServerProps } from 'payload'

import TargetFieldClient from './TargetField.client'

export const TargetField: RelationshipFieldServerComponent = async (
  props: RelationshipFieldServerProps,
) => {
  const { clientField, path } = props

  return <TargetFieldClient field={clientField} path={path} />
}

export default TargetField

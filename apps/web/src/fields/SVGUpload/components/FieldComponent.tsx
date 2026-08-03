import { UIFieldServerComponent, UIFieldServerProps } from 'payload'

import { get } from 'lodash-es'

import { FieldComponentClient } from './FieldComponent.client'

interface FieldComponentProps extends UIFieldServerProps {
  fieldToUse?: string
  name?: string
}

export const FieldComponent: UIFieldServerComponent = async ({
  clientField,
  data,
  fieldToUse,
}: FieldComponentProps) => {
  const adjustedValue: string = get(data, fieldToUse, '')

  return <FieldComponentClient field={clientField} initialValue={adjustedValue} path={fieldToUse} />
}

export default FieldComponent

import type { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { FieldComponentClient } from './FieldComponent.client'

type TitleFieldProps = {
  titlePath: string
} & TextFieldServerProps

export const FieldComponent: TextFieldServerComponent = async ({
  path,
  clientField,
  titlePath,
}: TitleFieldProps) => {
  return <FieldComponentClient field={clientField} path={path} titlePath={titlePath} />
}

export default FieldComponent

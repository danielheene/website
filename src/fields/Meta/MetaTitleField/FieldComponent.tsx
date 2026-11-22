import type { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { FieldComponentClient } from './FieldComponent.client'

type TitleFieldProps = {
  titlePath: string
} & TextFieldServerProps

export const FieldComponent: TextFieldServerComponent = async ({
  path,
  clientField,
  titlePath,
  readOnly,
}: TitleFieldProps) => {
  return (
    <FieldComponentClient
      field={clientField}
      path={path}
      titlePath={titlePath}
      readOnly={readOnly}
    />
  )
}

export default FieldComponent

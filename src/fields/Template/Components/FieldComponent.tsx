import { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import FieldComponentClient from '@/fields/TemplateField/Components/FieldComponent.client'

export const FieldComponent: TextFieldServerComponent = ({ field, path, readOnly, , clientField, siblingData, payload }: TextFieldServerProps) => {

  return <FieldComponentClient field={field} path={path} readOnly={readOnly} />
}

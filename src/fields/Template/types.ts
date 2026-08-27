import { BasePayload, TypedUser } from 'payload'

export type TemplateFieldAnnotation = {
  label: string
  entries: Record<string, string>
}

export type TemplateFieldAnnotationFunction = <
  SiblingData = Record<string, string>,
  Data = Record<string, string>,
  User = TypedUser,
  Payload = BasePayload,
>({
  siblingData,
  data,
  user,
  payload,
}: {
  siblingData: SiblingData
  data: Data
  user: User
  payload: Payload
}) => TemplateFieldAnnotation

export type TemplateFieldData = Record<string, string>
export type TemplateFieldDataFunction = <
  SiblingData = Record<string, string>,
  Data = Record<string, string>,
  User = TypedUser,
  Payload = BasePayload,
>({
  siblingData,
  data,
  user,
  payload,
}: {
  siblingData: SiblingData
  data: Data
  user: User
  payload: Payload
}) => TemplateFieldData

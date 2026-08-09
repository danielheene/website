import { deepMerge, GroupField } from 'payload'

import dedent from 'dedent'
import { OmitDeep } from 'type-fest'

type SectionGroupFieldOverrides = Partial<
  OmitDeep<
    GroupField,
    | 'type'
    | 'label'
    | 'name'
    | 'fields'
    | 'admin.description'
    | 'admin.hideGutter'
    | 'admin.components.Description'
  >
>

type SectionGroupFieldArgs = {
  label: string
  fields: GroupField['fields']
  name?: string
  hideGutter?: boolean
  description?: string
  overrides?: SectionGroupFieldOverrides
}

export const SectionGroupField = ({
  label,
  fields,
  name = undefined,
  hideGutter = true,
  description = '',
  overrides = {},
}: SectionGroupFieldArgs): GroupField => {
  return deepMerge<GroupField, Partial<GroupField>>(
    {
      type: 'group',
      label,
      name,
      fields,
      admin: {
        hideGutter,
        description: dedent.withOptions({
          alignValues: true,
          escapeSpecialCharacters: true,
        })(description),
        components: {
          Description: '@/fields/SectionGroup/components/DescriptionComponent',
        },
      },
    },
    overrides,
  )
}

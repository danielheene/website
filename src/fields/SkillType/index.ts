import { deepMerge, SelectField } from 'payload'

import { OmitDeep } from 'type-fest'

import { translate } from '@/lib/i18n'
import { SKILL_TYPE } from '@/types/select-options'

type SkillTypeFieldOverrides = Partial<
  OmitDeep<
    SelectField,
    'type' | 'options' | 'interfaceName' | 'admin.components.Field' | 'admin.components.Cell'
  >
>

type SkillTypeFieldProps = {
  name?: string
  overrides?: SkillTypeFieldOverrides
}

export const SkillTypeField = ({
  name = 'type',
  overrides = {},
}: SkillTypeFieldProps = {}): SelectField => {
  return deepMerge<SelectField, Partial<SelectField>>(
    {
      name,
      type: 'select',
      interfaceName: 'SkillType',
      options: Object.values(SKILL_TYPE).map((skillType) => ({
        label: translate('en', `skill.type.${skillType}`),
        value: skillType,
      })),
      admin: {
        components: {
          Field: '@/fields/SkillType/components/FieldComponent#FieldComponent',
          Cell: '@/fields/SkillType/components/Cell#Cell',
        },
      },
    },
    overrides,
  )
}

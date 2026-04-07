import { camelCase, startCase } from 'lodash-es'
import { deepMerge, type SelectField } from 'payload'

import { ICON, Icon } from '@/components/Icon'

type IconFieldOverrides = Partial<Omit<SelectField, 'name' | 'type' | 'options'>>

type IconFieldProps = {
  name?: string
  overrides?: Partial<Omit<SelectField, 'type' | 'name' | 'options'>>
}

export const IconField = ({ name = 'icon', overrides }: IconFieldProps = {}): SelectField =>
  deepMerge<SelectField, IconFieldOverrides>(
    {
      name,
      type: 'select',
      options: [
        ...Object.entries(ICON).map(([iconLabel, iconName]) => ({
          label: () => (
            <div className="flex items-center gap-2">
              <style>{`
              .react-select .rs__control {
                flex-wrap: nowrap;
              }
              `}</style>
              <Icon icon={iconName} className="size-[20px] text-[20px]" />
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{startCase(camelCase(iconLabel))}</span>
            </div>
          ),
          value: iconName,
        })),
      ],
    },
    overrides,
  )

import { deepMerge, UIField } from 'payload'

import { OmitDeep } from 'type-fest'

type SVGUploadProps = {
  fieldToUse: string
  overrides?: OmitDeep<
    Partial<UIField>,
    | 'name'
    | 'label'
    | 'type'
    | 'admin.components'
    | 'admin.disableBulkEdit'
    | 'admin.disableListColumn'
  >
}

export const SVGUpload = ({ fieldToUse, overrides = {} }: SVGUploadProps): UIField => {
  return deepMerge<UIField, Partial<UIField>>(
    {
      type: 'ui',
      name: 'upload',
      // @ts-expect-error
      label: false,
      admin: {
        disableListColumn: true,
        disableBulkEdit: true,
        components: {
          Field: {
            path: '@/fields/SVGUpload/components/FieldComponent',
            serverProps: {
              fieldToUse,
            },
          },
        },
      },
    },
    overrides,
  )
}

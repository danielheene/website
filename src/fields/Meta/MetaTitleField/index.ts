import type { TextField } from 'payload'

import { generateMetaTitleHook } from './hooks/generateMetaTitleHook'

interface MetaTitleFieldProps {
  titlePath: string
}

export const MetaTitleField = ({
  titlePath,
}: MetaTitleFieldProps): TextField => ({
  name: 'title',
  label: 'Title',
  type: 'text',
  defaultValue: '',
  admin: {
    disableListColumn: true,
    disableBulkEdit: true,
    disableListFilter: true,
    disableGroupBy: true,
    components: {
      Field: {
        path: '@/fields/Meta/MetaTitleField/FieldComponent',
        serverProps: {
          titlePath,
        },
      },
    },
  },
  hooks: {
    beforeValidate: [
      generateMetaTitleHook(titlePath),
    ],
  },
})

import { UIField } from 'payload'

type SVGUploadProps = {
  fieldToUse: string
}

export const SVGUpload = ({ fieldToUse }: SVGUploadProps): UIField => {
  return {
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
  }
}

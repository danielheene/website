import { deepMerge, type TextField } from 'payload'

type TitleFieldOverrides = Partial<Omit<TextField, 'name' | 'type' | 'required' | 'validate'>>

type TitleFieldProps = {
  listViewThumbnailPath?: string
  overrides?: TitleFieldOverrides
}

export const TitleField = ({
  listViewThumbnailPath,
  overrides = {},
}: TitleFieldProps = {}): TextField =>
  deepMerge<TextField, TitleFieldOverrides>(
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title', // force label, as label is also used in list views
      validate: (value: string) =>
        typeof value === 'string' && value.length > 3 ? true : 'Document needs a Title',
      admin: {
        placeholder: 'Title',
        // components: {
        //   // Label: false, // remove label component to avoid displaying label in edit view
        //   ...(listViewThumbnailPath
        //     ? {
        //         Cell: {
        //           path: '@/fields/Title/CellWithThumbnail',
        //           serverProps: {
        //             thumbnailPath: listViewThumbnailPath,
        //           },
        //         },
        //       }
        //     : {}),
        // },
      },
    },
    overrides,
  )

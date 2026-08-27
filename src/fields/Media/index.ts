import { UploadField } from 'payload'

import { ClassValue, cn } from 'tailwind-variants'
import { OmitDeep } from 'type-fest'

import { CollectionSlugValue, MediaCollectionSlug } from '@/types/collections'

type MediaFieldProps = {
  name: string
  label?: string
  relationTo: MediaCollectionSlug[]
  position?: UploadField['admin']['position']
  disabled?: UploadField['admin']['disabled']
  allowCreate?: UploadField['admin']['allowCreate']
  readOnly?: UploadField['admin']['readOnly']
  sortOptions?: Partial<Record<CollectionSlugValue, string>>
  className?: ClassValue
} & OmitDeep<
  UploadField,
  | 'type'
  | 'name'
  | 'label'
  | 'relationTo'
  | 'defaultValue'
  | 'admin.position'
  | 'admin.disabled'
  | 'admin.allowCreate'
  | 'admin.readOnly'
  | 'admin.className'
  | 'admin.sortOptions'
>

export const MediaField = (props: MediaFieldProps): UploadField => {
  const {
    name,
    relationTo,
    label,
    position = 'main',
    allowCreate = true,
    readOnly = false,
    disabled = false,
    className,
    sortOptions,
    ...restProps
  } = props

  return {
    type: 'upload',
    name,
    label,
    relationTo,
    defaultValue: [],
    ...restProps,
    admin: {
      disableGroupBy: true,
      disableBulkEdit: true,
      disableListColumn: true,
      disableListFilter: true,
      ...restProps.admin,
      sortOptions,
      className: cn([
        '[&_.pill]:hidden',
        '[&.read-only_.dropzone]:hidden',
        String.raw`[&.read-only_.upload.upload--has-many\_\_drag]:hidden`,
        String.raw`[&.read-only_.upload-relationship-details\_\_details]:mr-0`,
        className,
      ]),
      position,
      disabled,
      allowCreate,
      readOnly,
      condition: (_, siblingData) => {
        /* hide when editing is not allowed and field has no value */
        if (readOnly || disabled || !allowCreate) {
          return (
            name in siblingData && Array.isArray(siblingData[name]) && siblingData[name].length > 0
          )
        }
        return true
      },
    },
  }
}

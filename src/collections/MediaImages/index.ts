import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { CollectionConfig } from 'payload'
import { generateAlt } from './hooks/generateAlt'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'

export const MediaImages: CollectionConfig<CollectionSlug.MediaImages> = {
  slug: CollectionSlug.MediaImages,
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  admin: {
    disableCopyToLocale: true,
    group: AdminGroup.General,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    components: {
      Description: false,
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    disableLocalStorage: true,
    withMetadata: false,
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 500,
        height: 500,
        fit: 'cover',
        position: 'center',
        generateImageName: ({ originalName, sizeName, extension }) => {
          return `${originalName}-${sizeName}.${extension}`
        },
        admin: {
          disableGroupBy: true,
          disableListColumn: true,
          disableListFilter: true,
        },
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        condition: ({ mimeType, file }: Partial<{ mimeType: string; file: Partial<File> }>) => {
          const { type } = file || {}
          /* mimeType when already uploaded, file.type when selected for upload */
          return mimeType?.includes('image') || type?.includes('image')
        },
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    RichTextField({
      name: 'caption',
      editorVariant: 'caption',
    }),
    {
      name: 'blurDataURL',
      type: 'text',
      defaultValue: '',
      admin: {
        condition: ({ mimeType }) => mimeType?.includes('image'),
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
        hidden: true,
      },
    },
  ],
  hooks: {
    beforeChange: [generateBlurDataURL, generateAlt],
  },
}

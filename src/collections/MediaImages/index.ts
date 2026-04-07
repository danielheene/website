import { AdminGroup, CollectionSlug } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'

import { generateAlt } from './hooks/generateAlt'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'

export const MediaImages: CollectionConfig<CollectionSlug.MediaImages> = {
  slug: CollectionSlug.MediaImages,
  typescript: {
    interface: 'MediaImage',
  },
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  admin: {
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    disableCopyToLocale: true,
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
        fit: 'contain',
        background: 'transparent',
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
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    RichTextField({
      name: 'credits',
      editorVariant: 'caption',
    }),
    {
      name: 'blurDataURL',
      type: 'text',
      label: 'Blur Data URL',
      defaultValue: '',
      admin: {
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
  versions: {
    drafts: false,
    maxPerDoc: 0,
  },
}

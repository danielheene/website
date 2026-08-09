import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { RichTextField } from '@/fields/RichText'
import { generateChecksum } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { generateAlt } from './hooks/generateAlt'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'

export const MediaImages: CollectionConfig<CollectionSlug['MediaImages']> = {
  slug: CollectionSlug.MediaImages,
  typescript: {
    interface: 'MediaImage',
  },
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  enableQueryPresets: true,
  hooks: {
    beforeChange: [
      generateChecksum,
      generateBlurDataURL,
      generateAlt,
    ],
  },
  admin: {
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: [
      'filename',
      'type',
      'extension',
      'updatedAt',
    ],
    disableCopyToLocale: true,
    components: {
      Description: false,
    },
  },

  defaultPopulate: {
    filename: true,
    url: true,
    blurDataURL: true,
    alt: true,
    width: true,
    height: true,
  },
  access: {
    create: authenticated,
    /**
     * Reference checking is handled by the `references` plugin, which
     * blocks deletes in `beforeDelete` and reports which documents still use
     * the asset — across every collection, not just one hardcoded field path.
     */
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
    mimeTypes: [
      'image/*',
    ],
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
      label: 'File Name',
      admin: {
        disableGroupBy: true,
        disableListColumn: false,
        disableListFilter: true,
      },
    },
    {
      name: 'checksum',
      type: 'text',
      label: 'Checksum',
      index: true,
      admin: {
        readOnly: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        components: {
          Field: '@/collections/MediaImages/components#AltField',
        },
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

    GeneratorFlagsField(),
  ],

  versions: false,
}

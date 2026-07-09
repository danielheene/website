import { AdminGroup } from '@custom-types'

import type { AccessArgs, CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { CollectionSlug } from '@/types/collections'

import { generateAlt } from './hooks/generateAlt'
import { generateBlurDataURL } from './hooks/generateBlurDataURL'
import { generateChecksum } from '@/collections/MediaImages/hooks/generateChecksum'

export const MediaImages: CollectionConfig<CollectionSlug['MediaImages']> = {
  slug: CollectionSlug['MediaImages'],
  typescript: {
    interface: 'MediaImage',
  },
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  folders: {
    browseByFolder: false,
  },
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

  access: {
    create: authenticated,
    delete: async ({ req: { user, payload }, id }: AccessArgs<MediaImage>) => {
      if (!user) return false
      let references = 0

      try {
        const { totalDocs } = await payload.find({
          collection: CollectionSlug['MediaDocuments'],
          where: {
            thumbnail: {
              contains: id,
            },
          },
          pagination: false,
        })

        references += totalDocs
      } catch (_) {
        /* no references found */
      }

      return references === 0
    },
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
  ],

  versions: false,
}

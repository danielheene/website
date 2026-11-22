import type { CollectionConfig } from 'payload'

import { AttributionField } from '@/fields/Attribution'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { scopeMediaAssets } from '@/fields/GeneratorFlags/baseFilter'
import { anyone } from '@/lib/access/anyone'
import { authenticated } from '@/lib/access/authenticated'
import { generateChecksum } from '@/lib/payloadHooks/collection'
import { revalidateMediaUsageHooks } from '@/lib/payloadHooks/revalidateMediaUsage'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { enqueueProcessImage } from './hooks/enqueueProcessImage'

const mediaUsageHooks = revalidateMediaUsageHooks(CollectionSlug.MediaImages)

export const MediaImages: CollectionConfig<CollectionSlug['MediaImages']> = {
  slug: CollectionSlug.MediaImages,
  typescript: {
    interface: 'MediaImage',
  },
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  hooks: {
    beforeChange: [generateChecksum],
    afterChange: [enqueueProcessImage, mediaUsageHooks.afterChange],
    afterDelete: [mediaUsageHooks.afterDelete],
  },
  admin: {
    baseFilter: scopeMediaAssets,
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    disableCopyToLocale: true,
    pagination: {
      defaultLimit: 50,
      limits: [50, 100],
    },
    components: {
      Description: '@/components/AdminPanel/MediaScopeTabs#MediaScopeTabs',
      listMenuItems: ['@/components/AdminPanel/UnsplashSearch#UnsplashSearch'],
    },
  },

  defaultPopulate: {
    filename: true,
    url: true,
    blurDataURL: true,
    alt: true,
    width: true,
    height: true,
    // structured data credits the image wherever it is shown
    attribution: true,
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
        fit: 'cover',
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
    AttributionField(),
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

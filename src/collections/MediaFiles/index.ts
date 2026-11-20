import type { CollectionConfig } from 'payload'

import { AttributionField } from '@/fields/Attribution'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { scopeMediaAssets } from '@/fields/GeneratorFlags/baseFilter'
import { MediaField } from '@/fields/Media'
import { anyone } from '@/lib/access/anyone'
import { authenticated } from '@/lib/access/authenticated'
import { generateChecksum } from '@/lib/payloadHooks/collection'
import { revalidateMediaUsageHooks } from '@/lib/payloadHooks/revalidateMediaUsage'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { generateThumbnails } from './hooks/generateThumbnails'

const FILE_MIME_TYPES = [
  'application/pdf',
  // archives and installers (.zip, .tar.gz, .7z, .rar, .dmg, .pkg)
  'application/zip',
  'application/x-zip-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-apple-diskimage',
  'application/x-xar',
  // data and text
  'application/json',
  'text/markdown',
  'text/x-markdown',
  'text/plain',
  'text/csv',
  // office documents
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/rtf',
  'application/epub+zip',
  // fonts
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  // binaries without a registered type, e.g. Pixelmator's .pxd
  'application/octet-stream',
]

const mediaUsageHooks = revalidateMediaUsageHooks(CollectionSlug.MediaFiles)

export const MediaFiles: CollectionConfig<CollectionSlug['MediaFiles']> = {
  slug: CollectionSlug.MediaFiles,
  typescript: {
    interface: 'MediaFile',
  },
  labels: {
    singular: 'File',
    plural: 'Files',
  },
  hooks: {
    beforeChange: [generateChecksum],
    afterChange: [generateThumbnails, mediaUsageHooks.afterChange],
    afterDelete: [mediaUsageHooks.afterDelete],
  },
  admin: {
    baseFilter: scopeMediaAssets,
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    pagination: {
      defaultLimit: 50,
      limits: [50, 100],
    },
    components: {
      Description: '@/components/AdminPanel/MediaScopeTabs#MediaScopeTabs',
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
    hideRemoveFile: true,
    displayPreview: true,
    // images, video and audio have their own collections; renderable types
    // (HTML, SVG, XHTML) stay out, as files are served from this origin
    mimeTypes: FILE_MIME_TYPES,
    adminThumbnail: ({ doc }) => {
      if (Array.isArray(doc.thumbnails) && doc.thumbnails.length > 0) {
        const thumbnailFilename = String(doc.filename).replace(/\.[^/.]+$/, '-1-thumbnail.png')

        return `/api/${CollectionSlug.MediaImages}/file/${thumbnailFilename}`
      }
      // return `/api/${CollectionSlug['MediaImages']}/file/${thumbnailFilename}`
    },
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
    AttributionField(),
    {
      name: 'width',
      type: 'number',
      label: 'Width',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Height',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      label: 'MIME Type',
      admin: {
        hidden: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    MediaField({
      name: 'thumbnails',
      relationTo: [CollectionSlug.MediaImages],
      hasMany: true,
      readOnly: true,
      allowCreate: false,
    }),

    {
      name: 'thumbnailURL',
      type: 'text',
      label: 'Thumbnail URL',
      virtual: true,
      admin: {
        hidden: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    // {
    //   name: 'blurDataURL',
    //   type: 'text',
    //   label: 'Blur Data URL',
    //   admin: {
    //     readOnly: true,
    //     disableGroupBy: true,
    //     disableListColumn: true,
    //     disableListFilter: true,
    //   },
    // },

    GeneratorFlagsField(),
  ],
  versions: false,
}

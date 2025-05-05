import { anyone } from '@/payload/access/anyone'
import { createCollection } from '@/payload/utilities/schemaHelpers'
import sharp from 'sharp'

export const Media = createCollection({
  slug: 'media',
  labels: {
    singular: 'Media Asset',
    plural: 'Media Assets',
  },
  admin: {
    group: 'general',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    components: {
      Description: false,
    },
  },
  access: {
    read: anyone,
  },
  upload: {
    disableLocalStorage: true,
    withMetadata: false,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'blurDataURL',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'type',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [async ({ data: { mimeType } }) => mimeType?.split('/')?.[0]],
      },
    },
    {
      name: 'extension',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [async ({ data: { mimeType } }) => mimeType?.split('/')?.[1]],
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!req.file || !data.mimeType.startsWith('image')) return data

        const resizedImageBuffer = await sharp(req.file.data)
          .resize({
            width: 10,
            height: 10,
            fit: 'inside',
          })
          .toBuffer()

        return {
          ...data,
          blurDataURL: `data:${data.mimeType};base64,${resizedImageBuffer.toString('base64')}`,
        }
      },
    ],
  },
})

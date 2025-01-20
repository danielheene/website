import { anyone } from '@/payload/access/anyone'
import { createCollection } from '@/payload/utilities/schemaHelpers'
import { CollectionSlug, Condition } from 'payload'

const isImage: Condition = (_, { type } = {}) => type === 'image'

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
      edit: {
        Description: false,
      },
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
      name: 'brightness',
      type: 'number',
      admin: {
        readOnly: true,
        condition: isImage,
        position: 'sidebar',
      },
    },
    {
      name: 'blurHash',
      type: 'text',
      admin: {
        readOnly: true,
        condition: isImage,
        position: 'sidebar',
      },
    },
    {
      name: 'palette',
      type: 'json',
      admin: {
        readOnly: true,
        condition: isImage,
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [async ({ data: { mimeType } }) => mimeType.split('/')[0]],
      },
    },
    {
      name: 'extension',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [async ({ data: { mimeType } }) => mimeType.split('/')[1]],
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ collection, context, doc, operation, req }) => {
        if (context.runHooksAfterChange === false) return
        /** avoid running hooks when seeding as image references get lost */
        if (context.isSeedContext === true) return

        if ((operation === 'create' || operation === 'update') && req.file) {
          const imageUrl = new URL(doc.url, process.env.PAYLOAD_PUBLIC_SERVER_URL)

          const fetchEndpoint = async <R>(apiUrl: string): Promise<R> =>
            await fetch(new URL(apiUrl, process.env.PAYLOAD_PUBLIC_SERVER_URL), {
              method: 'POST',
              body: JSON.stringify({ imageUrl: imageUrl.toString() }),
            }).then((response) => response.json())

          const data = {
            blurHash: null,
            brightness: null,
            palette: null,
          }

          try {
            const json = await fetchEndpoint<{ blurHash?: string }>('/api/image/blurhash')
            data.blurHash = json.blurHash
          } catch (_) {
            /* empty */
          }

          try {
            const json = await fetchEndpoint<{ brightness?: string }>('/api/image/brightness')
            data.brightness = json.brightness
          } catch (_) {
            /* empty */
          }

          try {
            const json = await fetchEndpoint<{ palette?: string }>('/api/image/palette')
            data.palette = json.palette
          } catch (_) {
            /* empty */
          }

          try {
            await req.payload.update({
              collection: collection.slug as CollectionSlug,
              id: doc.id,
              data: {
                ...doc,
                ...data,
              },
              context: {
                runHooksAfterChange: false,
              },
              req,
            })
          } catch (e) {
            console.log(e)
          }
        }
      },
    ],
  },
})

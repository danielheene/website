import { anyone } from '@/payload/access/anyone'
import { createCollection } from '@/payload/utilities/schemaHelpers'
import { Condition, WorkflowTypes } from 'payload'
import { uniqueId } from 'lodash-es'
import * as process from 'node:process'

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
        components: {
          Field: '/payload/components/BlurHash#Field',
        },
        readOnly: true,
        condition: isImage,
        position: 'sidebar',
      },
    },
    {
      name: 'palette',
      type: 'json',
      admin: {
        components: {
          Field: '/payload/components/ColorPalette#Field',
        },
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
    afterOperation: [
      ({ operation, req, result }) => {
        // /* avoid running hooks when seeding or   as image references get lost */
        // if (req.context.isSeedContext === true) return
        if (req.context.isQueueContext === true) return

        if (['create', 'update', 'updateByID'].includes(operation) && req.file) {
          const doc = {
            ...result,
            url: new URL(result.url, process.env.PAYLOAD_PUBLIC_SERVER_URL).toString(),
          }

          const base64 = req.file.data.toString('base64')
          const queue = 'default'
          const workflowParams = { doc, base64, workflowId: uniqueId(`media#${doc.id}#`) }
          const workflowConfig = {
            workflow: 'generateImageMeta' as WorkflowTypes,
            input: workflowParams,
            queue,
            req,
          }

          Promise.resolve()
            .then(() => {
              req.payload.logger.info('----- adding workflow to queue')
              return req.payload.jobs.queue(workflowConfig)
            })
            .then(() => {
              req.payload.logger.info('----- running workflow from queue')
              return req.payload.jobs.run({ queue })
            })
            .then((result) => {
              req.payload.logger.info('----- finished workflow successfully')
              req.payload.logger.debug(result)
            })
            .catch((error) => {
              req.payload.logger.error(error, error?.message)
            })
        }
      },
    ],
  },
})

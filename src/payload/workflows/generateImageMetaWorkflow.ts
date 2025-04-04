import { JsonObject, WorkflowConfig } from 'payload'
import { Media } from '@payload-types'

export const generateImageMetaWorkflow: WorkflowConfig<'generateImageMeta'> = {
  slug: 'generateImageMeta',
  label: 'Generate Image Meta',
  inputSchema: [
    {
      name: 'workflowId',
      label: 'Workflow ID',
      type: 'text',
      required: true,
    },
    {
      name: 'base64',
      type: 'text',
      required: true,
    },
    {
      name: 'doc',
      type: 'json',
      required: true,
    },
  ],
  handler: async ({ req, tasks, job }) => {
    const { doc, workflowId, base64 } = job.input as unknown as {
      doc: Media & JsonObject
      workflowId: string
      base64: string
    }

    const { blurHash } = await tasks.createBlurHash(workflowId, { input: { base64 } })
    const { brightness } = await tasks.createBrightness(workflowId, { input: { base64 } })
    const { palette } = await tasks.createPalette(workflowId, { input: { base64 } })

    try {
      await req.payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          ...doc,
          blurHash,
          brightness,
          palette,
        },
        context: {
          isQueueContext: true,
        },
      })
      req.payload.logger.info('----- added metadata to image')
    } catch (e) {
      console.error(e)
    }
  },
}

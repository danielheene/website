import config from '@payload-config'
import { getPayload } from 'payload'

export const enqueueGenerateResumeDocuments = async () => {
  const payload = await getPayload({
    config,
  })

  /**
   * Create Resume Document Regeneration
   */
  try {
    await payload.jobs.queue({
      task: 'generateResumeDocumentTask',
      queue: 'default',
      input: {
        locale: 'en',
      },
    })

    await payload.jobs.queue({
      task: 'generateResumeDocumentTask',
      queue: 'default',
      input: {
        locale: 'de',
      },
    })

    await payload.jobs.run({
      allQueues: true,
    })

    console.info(
      `Added a new task to the queue to create the most recent resume document}`,
    )
  } catch (error) {
    console.error(
      `Failed to add task to queue for resume document generation`,
      error,
    )
  }
}

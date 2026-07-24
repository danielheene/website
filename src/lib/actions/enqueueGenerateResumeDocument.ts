'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { nanoid } from '@/lib/nanoid'
import { GlobalSlug } from '@/types/globals'
import { QueueSlug, WorkflowSlug } from '@/types/jobs-queue'

interface EnqueueGenerateResumeDocumentsInput {
  generateThrottle: number
  maximumRetries: number
  timeoutBetweenJobs: number
  forceNow: boolean
}

export const enqueueGenerateResumeDocument = async () => {
  const payload = await getPayload({
    config,
  })

  const {
    documentTitleTemplate,
    filenameTemplate,
    // generateThrottle,
    // maximumRetries,
    // timeoutBetweenJobs,
  } = await payload.findGlobal({
    slug: GlobalSlug.PDFGeneratorSettings,
    draft: false,
  })

  //
  // const jobs = await payload.find({
  //   collection: CollectionSlug.PayloadJobs,
  //   draft: false,
  //   where: {
  //     and: [
  //       {
  //         waitUntil: {
  //           less_than_equal: addMinutes(new Date(), 15).toISOString(),
  //         },
  //       },
  //       {
  //         waitUntil: {
  //           greater_than: new Date().toISOString(),
  //         },
  //       },
  //       {
  //         processing: {
  //           not_equals: true,
  //         },
  //       },
  //       {
  //         queue: {
  //           equals: QueueSlug.ResumeGeneration,
  //         },
  //       },
  //       {
  //         workflowSlug: {
  //           equals: WorkflowSlug.GenerateResumeDocument,
  //         },
  //       },
  //     ],
  //   },
  // })
  const sharedId = nanoid(32)

  /**
   * Create Resume Document Regeneration
   */
  try {
    await payload.jobs.queue({
      workflow: WorkflowSlug.GenerateResumeDocument,
      queue: QueueSlug.ResumeGeneration,
      input: {
        sharedId,
        documentTitleTemplate,
        filenameTemplate,
      },
    })

    // await payload.jobs.run({
    //   queue: QueueSlug.ResumeGeneration,
    // })

    console.info(`Added a new task to the queue to create the most recent resume document}`)
  } catch (error) {
    console.error(`Failed to add task to queue for resume document generation`, error)
  }
}

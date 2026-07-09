'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { nanoid } from '@/lib/nanoid'
import { renderTemplate } from '@/lib/renderTemplate'
import { GlobalSlug } from '@/types/globals'

export const enqueueGenerateResumeDocuments = async () => {
  const payload = await getPayload({
    config,
  })

  const {
    documentNameTemplate,
    fileNameTemplate,
    generateThrottle,
    maximumRetries,
    timeoutBetweenJobs,
  } = await payload.findGlobal({
    slug: GlobalSlug['SettingsPDFBuilder'],
    draft: false,
  })

  const sharedId = nanoid(32)
  const documentName = await renderTemplate({
    template: documentNameTemplate,
    data: {
      nanoid: sharedId,
    },
    locale: 'en',
  })
  if (documentName.error) {
    throw new Error(documentName.error)
  }

  const fileNameEnglish = await renderTemplate({
    template: fileNameTemplate,
    data: {
      nanoid: sharedId,
    },
    locale: 'en',
  })
  if (fileNameEnglish.error) {
    throw new Error(fileNameEnglish.error)
  }

  const fileNameGerman = await renderTemplate({
    template: fileNameTemplate,
    data: {
      nanoid: sharedId,
    },
    locale: 'de',
  })
  if (fileNameGerman.error) {
    throw new Error(fileNameGerman.error)
  }

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

    console.info(`Added a new task to the queue to create the most recent resume document}`)
  } catch (error) {
    console.error(`Failed to add task to queue for resume document generation`, error)
  }
}

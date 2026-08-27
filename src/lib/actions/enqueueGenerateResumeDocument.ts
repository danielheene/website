'use server'

import { after } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  addMilliseconds,
  addMinutes,
  formatDate,
  setMilliseconds,
  setSeconds,
  subMilliseconds,
} from 'date-fns'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { nanoid } from '@/lib/nanoid'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'
import { QueueSlug, WorkflowSlug } from '@/types/jobs-queue'

type Args =
  | {
      generateThrottle?: number
      maximumRetries?: number
      timeoutBetweenJobs?: number
      forceNow?: false
    }
  | {
      generateThrottle?: undefined
      maximumRetries?: undefined
      timeoutBetweenJobs?: undefined
      forceNow?: true
    }

export const enqueueGenerateResumeDocument = async (
  props: Args = {},
): Promise<{
  jobId: string
}> => {
  const payload = await getPayload({
    config,
  })

  const {
    forceNow = false,
    generateThrottle: generateThrottleFromProps,
    maximumRetries: maximumRetriesFromProps,
    timeoutBetweenJobs: timeoutBetweenJobsFromProps,
  } = props ?? {}

  const {
    documentTitleTemplate,
    filenameTemplate,
    generateThrottle: generateThrottleFromSettings,
    maximumRetries: maximumRetriesFromSettings,
    timeoutBetweenJobs: timeoutBetweenJobsFromSettings,
  } = await payload.findGlobal({
    slug: GlobalSlug.PDFGeneratorSettings,
    draft: false,
  })

  const sharedId = nanoid(32)
  const timeoutBetweenJobs = timeoutBetweenJobsFromProps ?? timeoutBetweenJobsFromSettings
  const generateThrottle = generateThrottleFromProps ?? generateThrottleFromSettings
  const maximumRetries = maximumRetriesFromProps ?? maximumRetriesFromSettings

  const waitUntil = forceNow
    ? new Date()
    : await calculateEarliestPossibleScheduleTime(timeoutBetweenJobs, generateThrottle)

  const job = await payload.jobs.queue({
    workflow: WorkflowSlug.GenerateResumeDocument,
    queue: QueueSlug.ResumeGeneration,
    waitUntil,
    input: {
      sharedId,
      documentTitleTemplate,
      filenameTemplate,
      maximumRetries,
    },
  })

  payload.logger.info(
    `Enqueued job ${job.id} at ${formatDate(job.waitUntil, 'yyyy-MM-dd HH:mm:ss')}`,
  )

  if (forceNow) {
    // Kicks the job off immediately rather than waiting for the next
    // `autoRun` poll, same as `enqueueSeedCollection` — run via `after()` so
    // it keeps executing once this action's response (with the job id) has
    // already gone back to the client to open its SSE subscription.
    after(async () => {
      try {
        await payload.jobs.runByID({
          id: job.id,
        })
      } catch (error) {
        payload.logger.error(`Failed running job ${job.id}: ${extractErrorMessage(error)}`)
      }
    })
  }

  return {
    jobId: String(job.id),
  }
}

/**
 * Calculate the earliest possible schedule time for a resume document generation job
 * @param timeoutBetweenJobs
 * @param generateThrottle
 * @returns Date
 */
async function calculateEarliestPossibleScheduleTime(
  timeoutBetweenJobs: number,
  generateThrottle: number,
): Promise<Date> {
  const payload = await getPayload({
    config,
  })

  /**
   * Find jobs that have completed in the last timeoutBetweenJobs milliseconds
   * or have errored in the last timeoutBetweenJobs milliseconds
   * or are currently processing
   */
  const {
    docs: [job],
  } = await payload.find({
    collection: CollectionSlug.PayloadJobs,
    draft: false,
    sort: '-createdAt',
    limit: 1,
    where: {
      or: [
        {
          and: [
            {
              completedAt: {
                greater_than_equal: subMilliseconds(new Date(), timeoutBetweenJobs).toISOString(),
              },
            },
            {
              processing: {
                equals: false,
              },
            },
            {
              workflowSlug: {
                equals: WorkflowSlug.GenerateResumeDocument,
              },
            },
          ],
        },
        {
          and: [
            {
              updatedAt: {
                greater_than_equal: subMilliseconds(new Date(), timeoutBetweenJobs).toISOString(),
              },
            },
            {
              hasError: {
                equals: true,
              },
            },
            {
              workflowSlug: {
                equals: WorkflowSlug.GenerateResumeDocument,
              },
            },
          ],
        },
        {
          and: [
            {
              processing: {
                equals: true,
              },
            },
            {
              workflowSlug: {
                equals: WorkflowSlug.GenerateResumeDocument,
              },
            },
          ],
        },
      ],
    },
  })

  /* allow running the job immediately when none of the following cases matches  */
  let earliestPossible: Date = new Date()
  if (job?.completedAt && !job?.hasError) {
    /* if job is completed and has no error, change earliestPossible to timeoutBetweenJobs based on last completedAt */
    earliestPossible = addMilliseconds(new Date(job.completedAt), timeoutBetweenJobs)
  } else if (job?.hasError && job?.updatedAt) {
    /* if job has error and has updatedAt, change earliestPossible to timeoutBetweenJobs based on last updatedAt */
    earliestPossible = addMilliseconds(new Date(job.updatedAt), timeoutBetweenJobs)
  } else if (job?.processing) {
    /* if job is processing, change earliestPossible to timeoutBetweenJobs based on current time */
    earliestPossible = addMilliseconds(new Date(), timeoutBetweenJobs)
  }

  /* add generateThrottle to the earliestPossible date to throttle changes */
  const earliestPossibleWithThrottle = addMilliseconds(earliestPossible, generateThrottle)

  /* round to the nearest minute */
  return addMinutes(
    setSeconds(setMilliseconds(earliestPossibleWithThrottle, 0), 0),
    earliestPossibleWithThrottle.getSeconds() > 30 ? 1 : 0,
  )
}

'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { nanoid } from '@repo/utils/nanoid'
import {
  addMilliseconds,
  addMinutes,
  formatDate,
  setMilliseconds,
  setSeconds,
  subMilliseconds,
} from 'date-fns'

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

export const enqueueGenerateResumeDocument = async (props: Args = {}) => {
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

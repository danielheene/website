import type { TaskHandler } from 'payload'

import { Interval } from '@/lib/date'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['CalculateSkillTagInterval']> = async ({
  input: { skillTagId },
  req,
}) => {
  const { payload } = req

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.ResumeJobs,
    draft: false,
    pagination: false,
    depth: 0,
    select: {
      startDate: true,
      endDate: true,
    },
    where: {
      'skillTags.value': {
        contains: skillTagId,
      },
    },
  })

  if (docs.length === 0) {
    payload.logger.info(`No jobs found for skill tag: ${skillTagId}`)

    await payload.update({
      collection: CollectionSlug.ResumeSkillTags,
      id: skillTagId,
      data: {
        interval: 0,
      },
    })

    return {
      output: {
        interval: 0,
      },
    }
  }

  payload.logger.info(`Found ${docs.length} jobs entries containing skill tag: ${skillTagId}`)

  const intervals: Interval[] = docs.map(
    ({ startDate, endDate }) => new Interval(startDate, endDate),
  )

  const mergedIntervals = Interval.mergeIntervals(intervals)

  payload.logger.info(`Merged ${mergedIntervals.length} intervals for skill tag: ${skillTagId}`)

  const intervalMonths = mergedIntervals.reduce((acc, curr) => acc + curr.differenceInMonths, 0)

  payload.logger.info(`Calculated ${intervalMonths} months for skill tag: ${skillTagId}`)

  await payload.update({
    collection: CollectionSlug.ResumeSkillTags,
    id: skillTagId,
    data: {
      interval: intervalMonths,
    },
  })

  payload.logger.info(`Updated skill tag ${skillTagId} with interval: ${intervalMonths}`)

  return {
    output: {
      interval: intervalMonths,
    },
  }
}

export const handler = run

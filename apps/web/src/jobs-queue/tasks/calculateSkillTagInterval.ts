import config from '@payload-config'
import { getPayload, TaskConfig } from 'payload'

import { Interval } from '@repo/utils/date'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

export const calculateSkillTagInterval: TaskConfig<TaskSlug['CalculateSkillTagInterval']> = {
  slug: TaskSlug.CalculateSkillTagInterval,
  label: 'Generate Skill Tag Interval',
  retries: 2,
  concurrency: {
    key: ({ input: { skillTagId } }) => `${TaskSlug.CalculateSkillTagInterval}:${skillTagId}`,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'skillTagId',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'interval',
      type: 'number',
    },
  ],
  handler: async ({ input: { skillTagId }, req }) => {
    'use server'

    const payload = await getPayload({
      config,
    })

    const { docs = [] } = await payload.find({
      collection: CollectionSlug.ResumeJobs,
      draft: false,
      pagination: false,
      limit: undefined,
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
      req.payload.logger.info(`No jobs found for skill tag: ${skillTagId}`)

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

    req.payload.logger.info(`Found ${docs.length} jobs entries containing skill tag: ${skillTagId}`)

    const intervals: Interval[] = docs.map(
      ({ startDate, endDate }) => new Interval(startDate, endDate),
    )

    const mergedIntervals = Interval.mergeIntervals(intervals)

    req.payload.logger.info(
      `Merged ${mergedIntervals.length} intervals for skill tag: ${skillTagId}`,
    )

    const intervalMonths = mergedIntervals.reduce((acc, curr) => acc + curr.differenceInMonths, 0)

    req.payload.logger.info(`Calculated ${intervalMonths} months for skill tag: ${skillTagId}`)

    await payload.update({
      collection: CollectionSlug.ResumeSkillTags,
      id: skillTagId,
      data: {
        interval: intervalMonths,
      },
    })

    req.payload.logger.info(`Updated skill tag ${skillTagId} with interval: ${intervalMonths}`)

    return {
      output: {
        interval: intervalMonths,
      },
    }
  },
}

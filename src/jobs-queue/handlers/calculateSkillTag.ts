import type { BasePayload, TaskHandler } from 'payload'

import { loadLatestDocument, latestWriteOptions } from '@/jobs-queue/lib/documentTaskHandler'
import { Interval } from '@/lib/date'
import { resolveDocumentTaskSteps } from '@/lib/documentTasks/definitions'
import { resolveSkillTagType } from '@/lib/resolveSkillTagType'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'
import type { ResumeSkillTagData } from '@/types/payload'

/** Months covered by the published jobs using the tag, overlapping periods counted once. */
const calculateInterval = async (payload: BasePayload, skillTagId: string) => {
  const { docs } = await payload.find({
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

  const intervals = docs.map(({ startDate, endDate }) => new Interval(startDate, endDate))

  return Interval.mergeIntervals(intervals).reduce(
    (months, interval) => months + interval.differenceInMonths,
    0,
  )
}

/** The type the published skills using the tag agree on; `null` when no typed skill uses it. */
const calculateType = async (payload: BasePayload, skillTagId: string) => {
  const { docs } = await payload.find({
    collection: CollectionSlug.ResumeSkills,
    draft: false,
    pagination: false,
    depth: 0,
    select: {
      type: true,
    },
    where: {
      and: [
        {
          'skillTags.value': {
            contains: skillTagId,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return resolveSkillTagType(docs.map((skill) => skill.type))
}

const run: TaskHandler<TaskSlug['CalculateSkillTag']> = async ({ input, req: { payload } }) => {
  const steps = resolveDocumentTaskSteps(TaskSlug.CalculateSkillTag, input.steps)
  const tag = await loadLatestDocument(payload, CollectionSlug.ResumeSkillTags, input.id)

  if (!tag) return { output: {} }

  const interval = steps.has('interval') ? await calculateInterval(payload, input.id) : null
  // a tag no typed skill references keeps whatever type it was given by hand
  const type = steps.has('type') ? await calculateType(payload, input.id) : null

  const data: Partial<ResumeSkillTagData> = {
    ...(interval !== null && { interval }),
    ...(type && { type }),
  }

  if (Object.keys(data).length > 0) {
    await payload.update({
      ...latestWriteOptions(
        payload,
        TaskSlug.CalculateSkillTag,
        CollectionSlug.ResumeSkillTags,
        tag,
      ),
      collection: CollectionSlug.ResumeSkillTags,
      data,
    })
  }

  payload.logger.info(`Skill tag ${input.ref ?? input.id}: ${JSON.stringify(data)}`)

  return {
    output: {
      interval,
      type,
    },
  }
}

export const handler = run

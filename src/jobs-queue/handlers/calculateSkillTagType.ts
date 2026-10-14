import type { TaskHandler } from 'payload'

import { resolveSkillTagType } from '@/lib/resolveSkillTagType'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['CalculateSkillTagType']> = async ({
  input: { skillTagId },
  req,
}) => {
  const { payload } = req

  const { docs = [] } = await payload.find({
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

  const type = resolveSkillTagType(docs.map((skill) => skill.type))

  // A tag no typed skill references keeps whatever type it was given by hand
  if (!type) {
    payload.logger.info(`No typed skills found for skill tag: ${skillTagId}, type unchanged`)

    return {
      output: {
        type: null,
      },
    }
  }

  await payload.update({
    collection: CollectionSlug.ResumeSkillTags,
    id: skillTagId,
    data: {
      type,
    },
  })

  payload.logger.info(`Resolved skill tag ${skillTagId} type from ${docs.length} skills: ${type}`)

  return {
    output: {
      type,
    },
  }
}

export const handler = run

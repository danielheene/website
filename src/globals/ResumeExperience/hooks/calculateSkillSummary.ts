import type { SkillSummary } from '@custom-types'
import { differenceInMonths } from 'date-fns'
import type { GlobalBeforeChangeHook } from 'payload'

import { CollectionSlug } from '@/types/collections'
import type { GlobalData, GlobalSlug } from '@/types/globals'
import type { ResumeSkill } from '@/types/payload'

type GlobalBeforeChangeHookParameters = Omit<
  Parameters<GlobalBeforeChangeHook>[number],
  'data'
> & {
  data: GlobalData<GlobalSlug.ResumeExperience>
}

export const calculateSkillSummary: GlobalBeforeChangeHook = async ({
  data,
  req,
}: GlobalBeforeChangeHookParameters) => {
  const summarizedSkills: SkillSummary = await data.jobHistory.reduce(
    async (
      prevValue: Promise<SkillSummary>,
      { startDate, endDate, skills },
    ) => {
      const value = await prevValue

      const months = differenceInMonths(
        endDate ? Date.parse(endDate) : Date.now(),
        Date.parse(startDate),
      )

      for (const skill of skills) {
        console.log('Processing skill:', skill)
        let skillData: ResumeSkill
        if (typeof skill === 'object') {
          skillData = skill
        } else {
          skillData = await req.payload.findByID({
            id: skill,
            collection: CollectionSlug.ResumeSkills,
          })
        }
        console.log('Processing skill data:', skillData)

        value[skillData.slug] = value[skillData.slug] || {
          label: skillData.name.en,
          time: 0,
        }
        value[skillData.slug].time += months
      }

      return value
    },
    Promise.resolve({}),
  )

  console.log('Summarized Skills before sorting:', summarizedSkills)

  const skillSummary = Object.fromEntries(
    Object.entries(summarizedSkills).sort(
      ([_ka, { time: aTime }], [_kb, { time: bTime }]) => bTime - aTime,
    ),
  )

  console.log('Skill Summary:', skillSummary)

  return {
    ...data,
    skillSummary,
  }
}

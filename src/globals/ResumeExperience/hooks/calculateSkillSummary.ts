import { SkillSummary } from '@custom-types'
import { differenceInMonths } from 'date-fns'
import { GlobalBeforeChangeHook } from 'payload'

export const calculateSkillSummary: GlobalBeforeChangeHook = async ({ data }) => {
  const summarizedSkills: SkillSummary = data.jobHistory.reduce((prevValue: SkillSummary, { startDate, endDate, technologies }) => {
    const months = differenceInMonths(endDate ? Date.parse(endDate) : Date.now(), Date.parse(startDate))

    technologies.forEach(({ id, label }) => {
      prevValue[id] = prevValue[id] || { label, time: 0 }
      prevValue[id].time += months
    })

    return prevValue
  }, {})

  const skillSummary = Object.fromEntries(
    Object.entries(summarizedSkills).sort(([_ka, { time: aTime }], [_kb, { time: bTime }]) => bTime - aTime),
  )

  return {
    ...data,
    skillSummary,
  }
}

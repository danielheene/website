import { differenceInMonths } from 'date-fns'
import { GlobalAfterChangeHook, GlobalSlug } from 'payload'

export const calculateSkillSummary: GlobalAfterChangeHook = async (props) => {
  const { req, global, doc, context } = props
  if (context.triggerAfterChange === false) return

  const summarizedSkills: Record<string, { label: string; time: number }> = doc.jobHistory.reduce(
    (prevValue, { startDate, endDate, technologies }) => {
      const months = differenceInMonths(endDate ? Date.parse(endDate) : Date.now(), Date.parse(startDate))

      technologies.forEach(({ id, label }) => {
        prevValue[id] = prevValue[id] || { label, time: 0 }
        prevValue[id].time += months
      })

      return prevValue
    },
    {},
  )

  const sortedSkills = Object.fromEntries(
    Object.entries(summarizedSkills).sort(([_ka, { time: aTime }], [_kb, { time: bTime }]) => bTime - aTime),
  )

  try {
    await req.payload.updateGlobal({
      slug: global.slug as GlobalSlug,
      data: {
        ...doc,
        skillSummary: sortedSkills,
      },
      context: {
        triggerAfterChange: false,
      },
      req,
    })
  } catch (e) {
    req.payload.logger.error(e)
  }
}

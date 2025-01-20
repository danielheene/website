import { GlobalBeforeChangeHook } from 'payload'
import { ResumeExperience } from '@payload-types'

export const sortEntriesByStartDate: GlobalBeforeChangeHook = async ({
  data,
}: {
  data: ResumeExperience
}) => {
  const entries = Array.isArray(data.entries) ? data.entries : []
  return {
    ...data,
    entries: entries
      .sort((a, b) => {
        return Date.parse(b.startDate) - Date.parse(a.startDate)
      })
      .map((data, index) => ({
        ...data,
        id: index + 1,
      })),
  }
}

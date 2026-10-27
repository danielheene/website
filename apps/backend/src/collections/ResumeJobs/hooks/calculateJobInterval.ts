import { FieldHook } from 'payload'

import { Interval } from '@website/lib/date'
import { ResumeJobData } from '@website/types/payload'

export const calculateJobInterval: FieldHook<
  ResumeJobData,
  ResumeJobData['interval'],
  ResumeJobData
> = async ({ siblingData: { startDate, endDate } }) => {
  if (!startDate) return 0

  return new Interval(startDate, endDate).differenceInMonths
}

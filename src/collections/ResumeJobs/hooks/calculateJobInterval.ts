import { FieldHook } from 'payload'

import { Interval } from '@/lib/dateTime'
import { ResumeJobData } from '@/types/payload'

export const calculateJobInterval: FieldHook<
  ResumeJobData,
  ResumeJobData['interval'],
  ResumeJobData
> = async ({ siblingData: { startDate, endDate } }) => {
  if (!startDate) return 0

  return new Interval(startDate, endDate).differenceInMonths
}

import type { WidgetServerProps } from 'payload'

import { fetchScheduledJobs } from './ScheduledJobsWidget.data'
import { ScheduledJobsWidgetList } from './ScheduledJobsWidget.List'

export const ScheduledJobsWidget = async (_props: WidgetServerProps) => {
  const jobs = await fetchScheduledJobs()

  return <ScheduledJobsWidgetList jobs={jobs ?? []} />
}

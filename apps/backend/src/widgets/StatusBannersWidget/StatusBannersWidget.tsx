import type { WidgetServerProps } from 'payload'

import { StatusBannerItem } from './StatusBannerItem'
import { fetchStaleJobs } from './StatusBannersWidget.data'

export const StatusBannersWidget = async (_props: WidgetServerProps) => {
  const staleJobs = await fetchStaleJobs()

  if (staleJobs.length === 0) return null

  return (
    <div className="flex flex-col gap-2 pb-4">
      {staleJobs.map((job) => (
        <StatusBannerItem
          key={job.id}
          id={job.id}
          jobName={job.taskSlug ?? job.workflowSlug ?? job.id}
          waitUntil={job.waitUntil ?? new Date().toISOString()}
        />
      ))}
    </div>
  )
}

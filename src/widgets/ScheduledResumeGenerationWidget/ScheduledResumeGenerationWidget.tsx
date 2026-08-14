import type { WidgetServerProps } from 'payload'

import { ScheduledResumeGenerationWidgetClient } from './ScheduledResumeGenerationWidget.client'
import { fetchPendingResumeGenerationJob } from './ScheduledResumeGenerationWidget.data'

export const ScheduledResumeGenerationWidget = async (_props: WidgetServerProps) => {
  const job = await fetchPendingResumeGenerationJob()

  if (!job) {
    return null
  }

  return (
    <ScheduledResumeGenerationWidgetClient
      jobId={job.id}
      createdAt={job.createdAt}
      waitUntil={job.waitUntil}
    />
  )
}

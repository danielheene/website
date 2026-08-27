import { TaskConfig } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

export const pingUptimeEndpoint: TaskConfig<TaskSlug['PingUptimeEndpoint']> = {
  slug: TaskSlug.PingUptimeEndpoint,
  label: 'Ping uptime endpoint',
  schedule: [
    {
      cron: '* * * * *',
      queue: QueueSlug.Heartbeat,
    },
  ],
  handler: async ({ req: { payload } }) => {
    if (typeof process.env.PAYLOAD_JOBS_ALIVE_URL === 'string') {
      payload.logger.info('Pinging uptime endpoint')
      const res = await fetch(process.env.PAYLOAD_JOBS_ALIVE_URL, {
        cache: 'no-cache',
      })
      const message = await res.json()
      payload.logger.info(JSON.stringify(message, null, 2))
    }
    return {
      output: {},
    }
  },
}

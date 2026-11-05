import type { TaskHandler } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { TaskSlug } from '@/types/jobs-queue'

export const handler: TaskHandler<TaskSlug['HeartbeatPing']> = async ({
  job: { taskSlug, workflowSlug },
}) => {
  const slug = workflowSlug ?? taskSlug
  const pushUrl = URL.parse(process.env.STATUS_PAGE_WORKER_HEARTBEAT_PUSH_URL ?? '')

  let type: 'push' | 'console'
  let message: string
  let ok: boolean = false

  if (pushUrl) {
    type = 'push'

    const urlParams = new URLSearchParams({
      status: 'up',
      msg: `${new Date().getTime()}`, // used to avoid caching
    })

    await fetch(`${pushUrl.toString()}?${urlParams.toString()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'X-Timestamp': `${new Date().getTime()}`,
      },
      cache: 'no-cache',
    })
      .then((response) => response.json())
      .then((json: { ok: boolean }) => {
        ok = json.ok

        if (ok) {
          message = 'heartbeat pushed successfully'
        } else {
          message = 'heartbeat push failed'
        }
      })
      .catch((error) => {
        ok = false
        message = 'error: ' + extractErrorMessage(error)
      })
  } else {
    type = 'console'
    ok = true
    message = 'ping'
  }

  const output = {
    type,
    message,
    ok,
  }

  console.log(`${slug}: `, output)

  return { output }
}

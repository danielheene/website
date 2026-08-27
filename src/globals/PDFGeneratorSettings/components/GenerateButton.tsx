'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast } from '@payloadcms/ui'

import { useServerSentEvents } from '@/components/hooks/use-server-sent-events'
import { enqueueGenerateResumeDocument } from '@/lib/actions/enqueueGenerateResumeDocument'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import type { ResumeGenerateProgress } from '@/lib/sse/channels'
import { resumeGenerateChannel } from '@/lib/sse/channels'

/**
 * How long to wait for a terminal SSE message before assuming the job
 * already finished. The job is triggered via `after()` and can complete
 * (publishing its terminal message) before the client has opened its SSE
 * subscription — Redis pub/sub has no replay, so that message would
 * otherwise be lost and the toast would stay stuck on "Queued…" forever.
 * Same rationale/value as `SeedActions`.
 */
const TERMINAL_MESSAGE_TIMEOUT_MS = 5000

const GenerateButton = () => {
  const router = useRouter()
  const [jobId, setJobId] = useState<string | null>(null)

  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }
  }, [])

  const handleClick = useCallback(async () => {
    try {
      const { jobId: newJobId } = await enqueueGenerateResumeDocument({
        forceNow: true,
      })

      setJobId(newJobId)
      toast.loading('Generating resume', {
        id: newJobId,
        description: 'Queued…',
      })

      clearFallbackTimeout()
      fallbackTimeoutRef.current = setTimeout(() => {
        fallbackTimeoutRef.current = null
        toast.success('Done.', {
          id: newJobId,
        })
        setJobId(null)
        router.refresh()
      }, TERMINAL_MESSAGE_TIMEOUT_MS)
    } catch (error) {
      toast.error(extractErrorMessage(error))
    }
  }, [
    clearFallbackTimeout,
    router,
  ])

  const handleProgress = useCallback(
    (data: ResumeGenerateProgress) => {
      if (!jobId) return

      switch (data.status) {
        case 'progress':
          toast.loading(data.step, {
            id: jobId,
          })
          return
        case 'success':
          clearFallbackTimeout()
          toast.success('Resume generated.', {
            id: jobId,
          })
          setJobId(null)
          router.refresh()
          return
        case 'error':
          clearFallbackTimeout()
          toast.error(data.message, {
            id: jobId,
          })
          setJobId(null)
          return
      }
    },
    [
      clearFallbackTimeout,
      jobId,
      router,
    ],
  )

  useServerSentEvents<ResumeGenerateProgress>({
    channel: jobId ? resumeGenerateChannel(jobId) : '',
    enabled: Boolean(jobId),
    onMessage: handleProgress,
  })

  return (
    <Button type="button" onClick={() => void handleClick()}>
      Generate
    </Button>
  )
}

export default GenerateButton

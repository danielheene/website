'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmationModal, Modal, toast, useModal } from '@payloadcms/ui'

import { useServerSentEvents } from '@/components/hooks/use-server-sent-events'
import { enqueueSeedCollection } from '@/lib/actions/enqueueSeedCollection'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import type { SeedTaskProgress } from '@/lib/sse/channels'
import { seedTaskChannel } from '@/lib/sse/channels'

import './SeedActions.styles.css'

/**
 * How long to wait for a terminal SSE message before assuming the job
 * already finished. The job is triggered via `after()` and can complete
 * (publishing its terminal message) before the client has opened its SSE
 * subscription — Redis pub/sub has no replay, so that message would
 * otherwise be lost and the toast would stay stuck on "Queued…" forever.
 */
const TERMINAL_MESSAGE_TIMEOUT_MS = 5000

type SeedActionsProps = {
  collectionSlug: string
  collectionLabel: string
}

const DEFAULT_COUNT = 10

export const SeedActions = ({ collectionSlug, collectionLabel }: SeedActionsProps) => {
  const router = useRouter()
  const { openModal, closeModal } = useModal()

  const [count, setCount] = useState(DEFAULT_COUNT)
  const [jobId, setJobId] = useState<string | null>(null)

  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }
  }, [])

  const seedModalSlug = `${collectionSlug}-seed-modal`
  const cleanModalSlug = `${collectionSlug}-clean-modal`

  const enqueue = useCallback(
    async (mode: 'seed' | 'clean') => {
      const title = mode === 'seed' ? `Seeding ${collectionLabel}` : `Cleaning ${collectionLabel}`

      try {
        const { jobId: newJobId } = await enqueueSeedCollection({
          collection: collectionSlug,
          mode,
          count: mode === 'seed' ? count : undefined,
        })

        setJobId(newJobId)
        toast.loading(title, {
          id: newJobId,
          description: 'Queued…',
        })

        // Fallback for the race where the job finishes and publishes its
        // terminal SSE message before the client has subscribed (Redis
        // pub/sub has no replay). If no terminal message clears jobId
        // within the timeout, assume the job is done anyway so the toast
        // doesn't stay stuck and the list view reflects reality.
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
    },
    [
      clearFallbackTimeout,
      collectionLabel,
      collectionSlug,
      count,
      router,
    ],
  )

  const handleProgress = useCallback(
    (data: SeedTaskProgress) => {
      if (!jobId) return

      switch (data.status) {
        case 'progress':
          toast.loading(`${data.step}`, {
            id: jobId,
            description: `${data.current}/${data.total}`,
          })
          return
        case 'success': {
          clearFallbackTimeout()
          const summary =
            data.created !== undefined
              ? `Created ${data.created} document(s).`
              : data.skipped !== undefined && data.skipped > 0
                ? `Deleted ${data.deleted ?? 0} document(s) (${data.skipped} skipped — still referenced), ${data.deletedMedia ?? 0} media file(s).`
                : `Deleted ${data.deleted ?? 0} document(s) and ${data.deletedMedia ?? 0} media file(s).`
          toast.success(summary, {
            id: jobId,
          })
          setJobId(null)
          router.refresh()
          return
        }
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

  useServerSentEvents<SeedTaskProgress>({
    channel: jobId ? seedTaskChannel(jobId) : '',
    enabled: Boolean(jobId),
    onMessage: handleProgress,
  })

  return (
    <>
      <Button
        type="button"
        buttonStyle="pill"
        size="small"
        onClick={() => openModal(seedModalSlug)}
      >
        Seed…
      </Button>
      <Button
        type="button"
        buttonStyle="pill"
        size="small"
        onClick={() => openModal(cleanModalSlug)}
      >
        Clean
      </Button>

      <Modal slug={seedModalSlug} className="seed-actions-modal">
        <div className="seed-actions-modal__body">
          <h3>Seed {collectionLabel}</h3>
          <label htmlFor="seed-count">Number of documents to create</label>
          <input
            id="seed-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10)
              setCount(Number.isNaN(parsed) ? 1 : Math.min(100, Math.max(1, parsed)))
            }}
          />
          <div className="seed-actions-modal__footer">
            <Button type="button" buttonStyle="secondary" onClick={() => closeModal(seedModalSlug)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                closeModal(seedModalSlug)
                void enqueue('seed')
              }}
            >
              Seed
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        modalSlug={cleanModalSlug}
        heading={`Delete all seeded ${collectionLabel}?`}
        body={`This deletes every ${collectionLabel} document tagged as seed data, along with the seeded media it references. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => enqueue('clean')}
      />
    </>
  )
}

export default SeedActions

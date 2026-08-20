'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmationModal, Modal, toast, useModal } from '@payloadcms/ui'

import { useServerSentEvents } from '@/components/hooks/use-server-sent-events'
import { enqueueSeedCollection } from '@/lib/actions/enqueueSeedCollection'
import { extractErrorMessage } from '@/lib/extractErrorMessage'
import type { SeedTaskProgress } from '@/lib/sse/channels'
import { seedTaskChannel } from '@/lib/sse/channels'

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
      } catch (error) {
        toast.error(extractErrorMessage(error))
      }
    },
    [
      collectionLabel,
      collectionSlug,
      count,
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
          const summary =
            data.created !== undefined
              ? `Created ${data.created} document(s).`
              : `Deleted ${data.deletedPages ?? 0} document(s) and ${data.deletedMedia ?? 0} media file(s).`
          toast.success(summary, {
            id: jobId,
          })
          setJobId(null)
          router.refresh()
          return
        }
        case 'error':
          toast.error(data.message, {
            id: jobId,
          })
          setJobId(null)
          return
      }
    },
    [
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
            onChange={(event) => setCount(Number.parseInt(event.target.value, 10) || 1)}
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

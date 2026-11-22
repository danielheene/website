'use client'

import { useCallback } from 'react'
import { Button, ConfirmationModal, PopupList, toast, useModal } from '@payloadcms/ui'

import { enqueueSyncSkillSortingAction } from '@/lib/actions/enqueueDocumentTasks'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

const MODAL_SLUG = 'sync-skill-sorting-modal'

type SyncSkillSortingActionProps = {
  /** `menu`: an item in the Skills list menu; `button`: next to the PDF Generator's controls. */
  variant?: 'menu' | 'button'
}

/** Queues `syncSkillSorting`, which merges new and removed skills into the PDF Generator's sorting. */
export const SyncSkillSortingAction = ({ variant = 'menu' }: SyncSkillSortingActionProps) => {
  const { openModal } = useModal()

  const enqueue = useCallback(async () => {
    try {
      const { jobId } = await enqueueSyncSkillSortingAction()

      toast.success('Sync skill sorting: queued', {
        description: `Job ${jobId}. Progress and result are in Payload Jobs.`,
      })
    } catch (error) {
      toast.error(extractErrorMessage(error))
    }
  }, [])

  return (
    <>
      {variant === 'menu' ? (
        <PopupList.Button onClick={() => openModal(MODAL_SLUG)}>
          Sync skill sorting…
        </PopupList.Button>
      ) : (
        <Button buttonStyle="secondary" size="medium" onClick={() => openModal(MODAL_SLUG)}>
          Sync skill sorting
        </Button>
      )}
      <ConfirmationModal
        modalSlug={MODAL_SLUG}
        heading="Sync skill sorting?"
        body="Adds published skills missing from the sorting lists and removes the ones no longer published. The existing order stays."
        confirmLabel="Run"
        cancelLabel="Cancel"
        onConfirm={enqueue}
      />
    </>
  )
}

import { CollectionAfterOperationHook } from 'payload'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

/**
 * Enqueues a {@link TaskSlug.SyncSkillSorting} job whenever a Resume Skill is
 * created, updated, or deleted, so the PDF Builder's skill sorting order stays
 * reconciled with the collection outside of the settings view (see
 * `syncSkillSorting` for why this moved off the field's `afterRead` hook).
 *
 * The task itself dedupes via `concurrency` + `supersedes`, so a burst of
 * skill edits collapses into a single sync rather than one job per change.
 */
export const enqueueSyncSkillSorting: CollectionAfterOperationHook = async ({ operation, req }) => {
  if (req.context?.skipSyncSkillSorting) return

  if (
    ![
      'create',
      'update',
      'updateByID',
      'delete',
      'deleteByID',
    ].includes(operation)
  ) {
    return
  }

  await req.payload.jobs.queue({
    task: TaskSlug.SyncSkillSorting,
    input: {},
    queue: QueueSlug.HookHandler,
  })
}

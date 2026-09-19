import { revalidateTag } from 'next/cache'
import { CollectionAfterChangeHook } from 'payload'

import { LATEST_RESUME_DOCUMENT_TAG } from '@/lib/fetchers/fetchLatestResumeDocument'
import { CollectionData, CollectionSlug } from '@/types/collections'

/**
 * Revalidates `fetchLatestResumeDocument`'s cache whenever a new resume
 * document is created, so the next read reflects it immediately instead of
 * waiting out `cacheLife('max')`.
 *
 * `revalidateTag` only works inside a live Next.js server context — it
 * throws `Invariant: static generation store missing` otherwise. This hook
 * fires on every `create` regardless of what triggered it, but in practice
 * that's `src/jobs-queue/tasks/createResumeDocument.ts`'s `payload.create()`
 * call, executed inside whichever process is actually running the job —
 * `jobs:run` (see `scripts/start-worker.mjs`), a bare Payload CLI process
 * with no Next runtime at all, unless `PAYLOAD_JOBS_ENABLE_APP_WORKERS=true`
 * has jobs running inside `app` instead. The call fails in the former and is
 * swallowed rather than thrown, the same way `proxy.ts`'s redirect lookup
 * treats a failure as "couldn't invalidate" rather than "the write itself
 * failed" — it only succeeds when this hook happens to fire from a process
 * that does have a Next context.
 */
export const revalidateLatestResumeDocument: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['ResumeDocuments']>
> = async ({ operation }): Promise<void> => {
  if (operation !== 'create') return

  try {
    revalidateTag(LATEST_RESUME_DOCUMENT_TAG, {
      expire: 0,
    })
  } catch {
    // No Next context to revalidate from (see comment above) — the next
    // read still gets a fresh value once cacheLife('max') naturally expires.
  }
}

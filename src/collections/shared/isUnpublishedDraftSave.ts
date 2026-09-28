/**
 * Whether a save only touched an unpublished draft, and therefore leaves the
 * published document (what every consumer reads via `draft: false`) exactly as
 * it was.
 *
 * Saving a draft over a published document is the case that still counts as a
 * change: unpublishing removes the document from every published read, so the
 * published data genuinely moved and downstream work must still run.
 */
export const isUnpublishedDraftSave = (doc: unknown, previousDoc?: unknown): boolean => {
  if (typeof doc !== 'object' || doc === null || !('_status' in doc)) return false

  const status = (
    doc as {
      _status?: unknown
    }
  )._status
  if (status === 'published') return false

  const previousStatus =
    typeof previousDoc === 'object' && previousDoc !== null && '_status' in previousDoc
      ? (
          previousDoc as {
            _status?: unknown
          }
        )._status
      : undefined

  return previousStatus !== 'published'
}

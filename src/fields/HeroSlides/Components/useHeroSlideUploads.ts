'use client'

import { useCallback, useState } from 'react'
import type { FormState } from 'payload'
import { toast } from '@payloadcms/ui'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { importPhoto } from '@/lib/unsplash/importPhoto'
import { uploadHeroSlideMedia } from '@/lib/uploadHeroSlideMedia'
import type { MediaImage, MediaVideo } from '@/types/payload'

export interface HeroSlideRowMutators {
  /**
   * Inserts a new row with the given placeholder sub-field state at
   * `rowIndex` — matching Payload's own `addFieldRow`. The caller always
   * knows this index ahead of time (the current row count for "append at
   * the end", or an explicit insert-between position), so it is required
   * here rather than discovered after the fact.
   *
   * `subFieldState` is a flat `FormState` keyed by the row's own sub-field
   * names (`slideType`, `media`) — Payload's `addFieldRow`/`replaceFieldRow`
   * prefix these with the row's real path themselves.
   */
  addRow: (args: { rowIndex: number; subFieldState: FormState }) => void
  /** Replaces a row's sub-field state in place — used to swap the pending placeholder for the real media relation once the upload resolves. */
  replaceRow: (args: { rowIndex: number; subFieldState: FormState }) => void
  /** Removes a row — used to roll back a failed upload's placeholder. */
  removeRow: (args: { rowIndex: number }) => void
  setBackgroundProcessing: (processing: boolean) => void
  /** Records the resolved doc's preview data outside form state — see `useHeroSlideFieldEditor`'s `MediaThumbnailCache` doc comment for why form state alone can't be trusted to keep it. */
  cacheThumbnail: (doc: MediaImage | MediaVideo, kind: 'image' | 'video') => void
}

const placeholderSubFieldState = (kind: 'image' | 'video'): FormState => ({
  slideType: {
    value: kind,
    initialValue: kind,
    valid: true,
  },
})

// `media.value` only needs to carry the id here — the real preview data
// lives in the caller's `MediaThumbnailCache` (populated via
// `mutators.cacheThumbnail` below), not in form state. See
// `useHeroSlideFieldEditor`'s doc comment for why: Payload's own debounced
// form-state sync overwrites any populated object placed here with a bare
// id anyway, within ~250ms of the row mutation.
const mediaRelationSubFieldState = (
  kind: 'image' | 'video',
  doc: MediaImage | MediaVideo,
): FormState => {
  const relationTo = kind === 'image' ? 'images' : 'videos'
  const value = {
    relationTo,
    value: doc.id,
  }

  return {
    slideType: {
      value: kind,
      initialValue: kind,
      valid: true,
    },
    media: {
      value,
      initialValue: value,
      valid: true,
    },
  }
}

/**
 * Orchestrates the optimistic background-insert flow shared by
 * `AddSlideMenu`'s "Upload Image"/"Upload Video"/"Import Unsplash" actions:
 * insert a placeholder row immediately, block the document from being saved
 * mid-operation (`setBackgroundProcessing`, which Payload's own
 * Save/Publish button already respects), run the real upload/import in the
 * background, then swap the placeholder for the real media relation — or
 * remove the row and surface a toast if it fails.
 *
 * Row mutation itself (`addRow`/`replaceRow`/`removeRow`) is dependency-
 * injected rather than called via `useForm()` directly, so this hook is
 * testable without a full Payload form context and so the array-editor
 * component that owns the real `addFieldRow`/`replaceFieldRow`/`removeFieldRow`
 * calls stays the single source of truth for the array's `path`/`schemaPath`.
 */
export const useHeroSlideUploads = (mutators: HeroSlideRowMutators) => {
  const [importingId, setImportingId] = useState<string | null>(null)
  const [pendingRowIndex, setPendingRowIndex] = useState<number | null>(null)

  /** Shared by `uploadFile` and `importUnsplashPhoto` — both insert a `kind`-typed placeholder row, run an async op, and resolve to the new media doc (or reject). */
  const runBackgroundInsert = useCallback(
    async (
      kind: 'image' | 'video',
      rowIndex: number,
      run: () => Promise<MediaImage | MediaVideo>,
    ) => {
      const placeholderId = `pending-${kind}-${Date.now()}`
      setImportingId(placeholderId)
      setPendingRowIndex(rowIndex)
      mutators.setBackgroundProcessing(true)
      mutators.addRow({
        rowIndex,
        subFieldState: placeholderSubFieldState(kind),
      })

      try {
        const doc = await run()

        mutators.cacheThumbnail(doc, kind)
        mutators.replaceRow({
          rowIndex,
          subFieldState: mediaRelationSubFieldState(kind, doc),
        })
      } catch (error) {
        mutators.removeRow({
          rowIndex,
        })
        toast.error(extractErrorMessage(error))
      } finally {
        setImportingId(null)
        setPendingRowIndex(null)
        mutators.setBackgroundProcessing(false)
      }
    },
    [
      mutators,
    ],
  )

  const uploadFile = useCallback(
    (kind: 'image' | 'video', file: File, rowIndex: number) =>
      runBackgroundInsert(kind, rowIndex, async () => {
        const formData = new FormData()
        formData.set('file', file)
        formData.set('kind', kind)

        const { doc } = await uploadHeroSlideMedia(formData)
        return doc
      }),
    [
      runBackgroundInsert,
    ],
  )

  const importUnsplashPhoto = useCallback(
    (photoId: string, rowIndex: number) =>
      runBackgroundInsert('image', rowIndex, async () => {
        const { id, url, alt, blurDataURL } = await importPhoto({
          photoId,
        })
        // `importPhoto` returns a flat shape (id/url/alt/blurDataURL), not a
        // full `MediaImage` doc — build just enough of one for
        // `resolveSlideThumbnail` to render this slide's preview.
        return {
          id,
          url: url ?? undefined,
          alt: alt ?? undefined,
          blurDataURL: blurDataURL ?? undefined,
        } as MediaImage
      }),
    [
      runBackgroundInsert,
    ],
  )

  return {
    importingId,
    pendingRowIndex,
    uploadFile,
    importUnsplashPhoto,
  }
}

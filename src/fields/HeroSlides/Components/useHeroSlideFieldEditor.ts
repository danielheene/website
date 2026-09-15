'use client'

import { useCallback, useState } from 'react'
import type { ArrayFieldClientProps, FormState } from 'payload'
import { useField, useForm } from '@payloadcms/ui'

import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import type { MediaImage, MediaVideo } from '@/types/payload'

import type { MediaThumbnailCache } from './resolveSlideThumbnail'
import { useHeroSlideUploads } from './useHeroSlideUploads'

// `media.value` in Payload's own form state cannot be trusted to hold a
// populated object: ~250ms after any row mutation, Payload's debounced
// `executeOnChange` sends the form to a server action that re-derives field
// state and merges it back in (`Form/index.js`'s `executeOnChange` →
// `mergeServerFormState`). For this array's `upload` sub-field the server
// always returns a bare id for `media.value`, overwriting whatever populated
// object was set optimistically on `addRow`/`replaceRow`, however minimal.
// So previews read from `MediaThumbnailCache` (populated below, at the
// moment a doc is picked) instead of ever trusting form state for this.
const imageThumbnailValue = (doc: MediaImage) => ({
  url: doc.url,
})
const videoThumbnailValue = (doc: MediaVideo) => ({
  thumbnails: doc.thumbnails,
})

const imageSubFieldState = (doc: MediaImage): FormState => {
  const value = {
    relationTo: 'images',
    value: doc.id,
  }
  return {
    slideType: {
      value: 'image',
      initialValue: 'image',
      valid: true,
    },
    media: {
      value,
      initialValue: value,
      valid: true,
    },
  }
}

const videoSubFieldState = (doc: MediaVideo): FormState => {
  const value = {
    relationTo: 'videos',
    value: doc.id,
  }
  return {
    slideType: {
      value: 'video',
      initialValue: 'video',
      valid: true,
    },
    media: {
      value,
      initialValue: value,
      valid: true,
    },
  }
}

const shaderSubFieldState = (key: ShaderPresetKey): FormState => ({
  slideType: {
    value: 'shader',
    initialValue: 'shader',
    valid: true,
  },
  shader: {
    value: key,
    initialValue: key,
    valid: true,
  },
})

/**
 * The row-mutation core shared by every `HeroSlidesField` admin UI —
 * `FilmstripEditor` (Pages' wide main-content tab) and the sidebar editor
 * (Posts/Topics' compact single-preview widget). Both need the same real
 * `useField`/`useForm()` bindings and the same insert/replace helpers for
 * each of the six "+ Add Hero BG" actions; only the layout differs, so that
 * layout is the only thing left to each component.
 */
export const useHeroSlideFieldEditor = (props: ArrayFieldClientProps) => {
  const { path: pathFromProps, schemaPath: schemaPathFromProps } = props
  const schemaPath = schemaPathFromProps ?? props.field.name

  const { path, rows = [] } = useField({
    hasRows: true,
    potentiallyStalePath: pathFromProps,
  })

  const { addFieldRow, moveFieldRow, removeFieldRow, replaceFieldRow, setBackgroundProcessing } =
    useForm()

  // See `MediaThumbnailCache`'s doc comment — form state cannot be trusted
  // to keep a populated `media.value`, so this is the real source of truth
  // for what each row's preview should show.
  const [thumbnailCache, setThumbnailCache] = useState<MediaThumbnailCache>({})
  const cacheThumbnail = useCallback((doc: MediaImage | MediaVideo, kind: 'image' | 'video') => {
    const value: MediaThumbnailCache[string] =
      kind === 'image'
        ? imageThumbnailValue(doc as MediaImage)
        : videoThumbnailValue(doc as MediaVideo)
    setThumbnailCache((prev) => ({
      ...prev,
      [doc.id]: value,
    }))
  }, [])

  const addRow = useCallback(
    (args: { rowIndex: number; subFieldState: FormState }) =>
      addFieldRow({
        ...args,
        path,
        schemaPath,
      }),
    [
      addFieldRow,
      path,
      schemaPath,
    ],
  )
  const replaceRow = useCallback(
    (args: { rowIndex: number; subFieldState: FormState }) =>
      replaceFieldRow({
        ...args,
        path,
        schemaPath,
      }),
    [
      replaceFieldRow,
      path,
      schemaPath,
    ],
  )
  const removeRow = useCallback(
    (args: { rowIndex: number }) =>
      removeFieldRow({
        ...args,
        path,
      }),
    [
      removeFieldRow,
      path,
    ],
  )
  const moveRow = useCallback(
    (fromIndex: number, toIndex: number) =>
      moveFieldRow({
        moveFromIndex: fromIndex,
        moveToIndex: toIndex,
        path,
      }),
    [
      moveFieldRow,
      path,
    ],
  )

  const { importingId, pendingRowIndex, importUnsplashPhoto, uploadFile } = useHeroSlideUploads({
    addRow,
    removeRow,
    replaceRow,
    setBackgroundProcessing,
    cacheThumbnail,
  })

  const insertImage = useCallback(
    (rowIndex: number, doc: MediaImage) => {
      cacheThumbnail(doc, 'image')
      addRow({
        rowIndex,
        subFieldState: imageSubFieldState(doc),
      })
    },
    [
      addRow,
      cacheThumbnail,
    ],
  )
  const insertVideo = useCallback(
    (rowIndex: number, doc: MediaVideo) => {
      cacheThumbnail(doc, 'video')
      addRow({
        rowIndex,
        subFieldState: videoSubFieldState(doc),
      })
    },
    [
      addRow,
      cacheThumbnail,
    ],
  )
  const insertShader = useCallback(
    (rowIndex: number, key: ShaderPresetKey) =>
      addRow({
        rowIndex,
        subFieldState: shaderSubFieldState(key),
      }),
    [
      addRow,
    ],
  )
  const replaceWithImage = useCallback(
    (rowIndex: number, doc: MediaImage) => {
      cacheThumbnail(doc, 'image')
      replaceRow({
        rowIndex,
        subFieldState: imageSubFieldState(doc),
      })
    },
    [
      replaceRow,
      cacheThumbnail,
    ],
  )
  const replaceWithVideo = useCallback(
    (rowIndex: number, doc: MediaVideo) => {
      cacheThumbnail(doc, 'video')
      replaceRow({
        rowIndex,
        subFieldState: videoSubFieldState(doc),
      })
    },
    [
      replaceRow,
      cacheThumbnail,
    ],
  )
  const replaceWithShader = useCallback(
    (rowIndex: number, key: ShaderPresetKey) =>
      replaceRow({
        rowIndex,
        subFieldState: shaderSubFieldState(key),
      }),
    [
      replaceRow,
    ],
  )

  return {
    path,
    rows,
    removeRow,
    moveRow,
    importingId,
    pendingRowIndex,
    importUnsplashPhoto,
    uploadFile,
    insertImage,
    insertVideo,
    insertShader,
    replaceWithImage,
    replaceWithVideo,
    replaceWithShader,
    thumbnailCache,
  }
}

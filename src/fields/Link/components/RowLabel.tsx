'use client'

import { useEffect, useState } from 'react'
import type { ValueWithRelation } from 'payload'
import { useField, useRowLabel } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'
import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'

type LinkEntryRowData = {
  link?: LinkFieldDataLean
  id?: string | null
}

const COLLECTION_LABELS: Record<string, string> = {
  pages: 'Page',
  posts: 'Post',
  topics: 'Topic',
}

/**
 * Collapsed-row label for a `LinkField()` array entry.
 *
 * Layout: [icon?] label text  [url or collection hint]
 *
 * - Internal link hint: `[CollectionName: title]` — fetches the document title
 *   from the API when the relationship value is a raw ID (form state), or reads
 *   it directly when the doc is already populated (e.g. after page load).
 * - Custom URL hint: `[https://…]`
 * - Falls back to a numbered placeholder when text is absent.
 */
export const LinkRowLabel = () => {
  const { data, path, rowNumber } = useRowLabel<LinkEntryRowData>()
  const { value: docValue } = useField<ValueWithRelation | null>({
    path: `${path}.link.doc`,
  })

  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null)

  const relationTo = docValue?.relationTo ?? null
  const docId = docValue?.value ?? null

  useEffect(() => {
    if (!relationTo || !docId) {
      setFetchedTitle(null)
      return
    }

    // If the doc is already populated in form state (object), no fetch needed —
    // the hint logic below reads it directly from `data.link.doc.value`.
    const link = data?.link
    if (typeof link?.doc?.value === 'object' && link.doc.value != null) return

    let cancelled = false
    fetch(`/api/${relationTo}/${docId}?depth=0&select[title]=true`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (!cancelled) setFetchedTitle(doc?.title ?? null)
      })
      .catch(() => {
        if (!cancelled) setFetchedTitle(null)
      })

    return () => {
      cancelled = true
    }
  }, [
    relationTo,
    docId,
    data?.link,
  ])

  const link = data?.link
  const number = (rowNumber ?? 0) + 1

  const icon = link?.iconBefore ?? link?.iconAfter ?? null
  const text = link?.text?.trim() || null

  let hint: string | null = null

  if (link?.linkType === 'custom') {
    const url = link.url?.trim()
    if (url) hint = `[${url}]`
  } else if (link?.doc) {
    const { relationTo: rel, value } = link.doc
    const collectionLabel = COLLECTION_LABELS[rel ?? ''] ?? rel ?? ''

    const docTitle =
      typeof value === 'object' && value != null
        ? ((
            value as {
              title?: string
              slug?: string
            }
          ).title ??
          (
            value as {
              slug?: string
            }
          ).slug ??
          null)
        : (fetchedTitle ?? (typeof value === 'string' ? value : null))

    if (collectionLabel || docTitle) {
      hint = docTitle ? `[${collectionLabel}: ${docTitle}]` : `[${collectionLabel}]`
    }
  }

  const label = text ?? hint?.replace(/^\[|\]$/g, '') ?? `Link ${number}`
  const showHint = hint && text

  return (
    <span className="flex items-center gap-2 text-sm">
      {icon && <Icon name={icon} className="size-4 shrink-0" />}
      <span>{label}</span>
      {showHint && <span className="max-w-64 truncate text-xs opacity-50">{hint}</span>}
    </span>
  )
}

export default LinkRowLabel

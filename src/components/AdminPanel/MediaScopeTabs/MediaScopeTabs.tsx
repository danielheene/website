'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button, useListDrawerContext } from '@payloadcms/ui'

import {
  MEDIA_SCOPE_PARAM,
  MediaScope,
  resolveMediaScope,
} from '@/fields/GeneratorFlags/baseFilter'

import './MediaScopeTabs.styles.css'

const SCOPES: {
  label: string
  value: MediaScope
}[] = [
  {
    label: 'Uploaded',
    value: MediaScope.Uploaded,
  },
  {
    label: 'Generated',
    value: MediaScope.Generated,
  },
  {
    label: 'All files',
    value: MediaScope.All,
  },
]

/**
 * Scopes the media list to hand-uploaded assets, task-generated ones, or
 * everything, by setting the `scope` query parameter that the collections'
 * `baseFilter` reads.
 *
 * Rendered through the collection's `Description` slot. Payload's own tab row
 * takes a fixed set of buttons (All / By Folder / Trash) with no extension
 * point, and only renders when `trash` or `folders` is enabled, so there is no
 * supported way to add a tab. `Description` sits directly under the collection
 * title — the closest supported position — and the media collections have no
 * description to displace.
 */
export const MediaScopeTabs = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isInDrawer } = useListDrawerContext()

  const active = resolveMediaScope(searchParams.get(MEDIA_SCOPE_PARAM))

  const select = useCallback(
    (scope: MediaScope) => {
      if (scope === active) return

      const params = new URLSearchParams(searchParams.toString())

      if (scope === MediaScope.Uploaded) {
        params.delete(MEDIA_SCOPE_PARAM)
      } else {
        params.set(MEDIA_SCOPE_PARAM, scope)
      }

      // Row counts differ between scopes, so the current page does not carry
      // over.
      params.delete('page')

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [
      active,
      pathname,
      router,
      searchParams,
    ],
  )

  /**
   * `Description` is rendered by the document edit view as well as the list —
   * it lands in `doc-header__after-header` there — and by list drawers. In
   * neither case is a list-scope switcher meaningful, and on an edit page the
   * buttons would push the collection route, navigating away from the document.
   *
   * The list route is `/collections/<slug>`; anything deeper is a document.
   */
  const isListView = /\/collections\/[^/]+$/.test(pathname)

  if (isInDrawer || !isListView) return null

  return (
    <div className="media-scope-tabs">
      {SCOPES.map(({ label, value }) => (
        <Button
          buttonStyle={value === active ? 'pill' : 'transparent'}
          el="button"
          key={value}
          onClick={() => select(value)}
          size="small"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export default MediaScopeTabs

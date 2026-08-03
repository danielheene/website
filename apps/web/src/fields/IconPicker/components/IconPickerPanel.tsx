'use client'

import { useState } from 'react'

import { ICON, Icon } from '@repo/ui/Icon'
import { cn } from '@repo/utils/cn'

import { useIconSearch } from '../useIconSearch'

/** Curated project icons, offered before the user types a query. */
const SUGGESTED_ICONS = Object.values(ICON) as string[]

export interface IconPickerPanelProps {
  value?: string
  onSelectAction: (icon: string) => void
  onClearAction?: () => void
  /** Restrict search to one Iconify collection, e.g. `simple-icons`. */
  prefix?: string
  className?: string
}

/**
 * Searchable Iconify icon grid, shared by the Payload field component and the
 * Lexical toolbar feature so both behave identically.
 */
export const IconPickerPanel = ({
  value,
  onSelectAction,
  onClearAction,
  prefix,
  className,
}: IconPickerPanelProps) => {
  const [query, setQuery] = useState<string>('')
  const { icons, loading, error } = useIconSearch({
    query,
    prefix,
  })

  const results = query.trim().length < 2 ? SUGGESTED_ICONS : icons

  return (
    <div
      className={cn([
        'flex w-full flex-col gap-3',
        className,
      ])}
    >
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons…"
          aria-label="Search icons"
          className="w-full rounded-md border border-[var(--theme-elevation-150)] bg-[var(--theme-input-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--theme-elevation-400)]"
        />
        {value && onClearAction && (
          <button
            type="button"
            onClick={onClearAction}
            className="shrink-0 rounded-md border border-[var(--theme-elevation-150)] px-3 py-2 text-sm hover:bg-[var(--theme-elevation-50)]"
          >
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-sm text-[var(--theme-error-500)]">{error}</p>}

      {loading && <p className="text-sm text-[var(--theme-elevation-500)]">Searching…</p>}

      {!loading && results.length === 0 && (
        <p className="text-sm text-[var(--theme-elevation-500)]">
          {query.trim().length < 2 ? 'Type at least two characters to search.' : 'No icons found.'}
        </p>
      )}

      {results.length > 0 && (
        <ul className="grid max-h-64 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 overflow-y-auto">
          {results.map((iconName) => (
            <li key={iconName}>
              <button
                type="button"
                title={iconName}
                aria-label={iconName}
                aria-pressed={value === iconName}
                onClick={() => onSelectAction(iconName)}
                className={cn([
                  'flex aspect-square w-full items-center justify-center rounded-md border transition-colors',
                  value === iconName
                    ? 'border-[var(--theme-success-500)] bg-[var(--theme-elevation-100)]'
                    : 'border-transparent hover:bg-[var(--theme-elevation-100)]',
                ])}
              >
                <Icon name={iconName} className="size-5 text-[20px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

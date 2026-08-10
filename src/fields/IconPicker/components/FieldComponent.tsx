'use client'

import { useState } from 'react'
import type { TextFieldClientProps } from 'payload'
import { FieldLabel, useField } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'

import { IconPickerPanel } from './IconPickerPanel'

type FieldComponentProps = {
  /** Restrict search to one Iconify collection, e.g. `simple-icons`. */
  prefix?: string
} & TextFieldClientProps

/**
 * Payload admin control for picking an Iconify icon. Stores the icon name
 * (`prefix:name`) as plain text, so values stay portable and render directly
 * through `<Icon name={…} />`.
 */
const FieldComponent = ({ prefix, path, field, readOnly }: FieldComponentProps) => {
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
  })
  const [open, setOpen] = useState<boolean>(false)

  return (
    <div className="field-type">
      <FieldLabel label={field?.label} path={path} required={field?.required} />

      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--theme-elevation-150)]">
          {value ? (
            <Icon name={value} className="size-6 text-[24px]" />
          ) : (
            <span className="text-xs text-[var(--theme-elevation-400)]">—</span>
          )}
        </span>

        <input
          type="text"
          value={value ?? ''}
          readOnly={readOnly}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. simple-icons:github"
          className="w-full rounded-md border border-[var(--theme-elevation-150)] bg-[var(--theme-input-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--theme-elevation-400)]"
        />

        {!readOnly && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="shrink-0 rounded-md border border-[var(--theme-elevation-150)] px-3 py-2 text-sm hover:bg-[var(--theme-elevation-50)]"
          >
            {open ? 'Close' : 'Browse'}
          </button>
        )}
      </div>

      {open && !readOnly && (
        <div className="mt-3 rounded-md border border-[var(--theme-elevation-150)] p-3">
          <IconPickerPanel
            value={value}
            prefix={prefix}
            onSelectAction={(icon) => {
              setValue(icon)
              setOpen(false)
            }}
            onClearAction={() => setValue('')}
          />
        </div>
      )}

      {showError && errorMessage && (
        <p className="mt-2 text-sm text-[var(--theme-error-500)]">{errorMessage}</p>
      )}
    </div>
  )
}

export default FieldComponent

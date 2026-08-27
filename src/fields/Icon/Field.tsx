'use client'

import type { TextFieldClientProps } from 'payload'
import { Button, FieldError, FieldLabel, useDrawerSlug, useField, useModal } from '@payloadcms/ui'

import { Icon, type IconName } from '@/components/Icon'

import { describeIcon } from './favorites'
import { IconPickerDrawer } from './IconPickerDrawer'

type IconFieldComponentProps = {
  /** Restrict Iconify search to one collection, e.g. `simple-icons`. */
  prefix?: string
  /**
   * Render the field's label. Off by default: the icon square carries its own
   * tooltip, so in a row of narrow columns a label is usually just noise.
   */
  showLabel?: boolean
  /**
   * Render the free-text input beside the square, for pasting a name directly.
   * Off by default — the square opens the picker, which is the intended path.
   */
  showInput?: boolean
} & TextFieldClientProps

/**
 * Payload admin control for picking an icon. Stores either a curated key
 * (`github`) or a full Iconify name (`simple-icons:github`) as plain text, both
 * of which `<Icon />` renders directly.
 *
 * Renders as a bare icon square by default — click it to open the picker. Pass
 * `showLabel` and/or `showInput` to grow it back into a labelled row with a
 * manual text entry.
 */
const IconFieldComponent = ({
  prefix,
  showLabel = false,
  showInput = false,
  path,
  field,
  readOnly,
}: IconFieldComponentProps) => {
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
  })
  const { openModal } = useModal()
  // scoped per field path so two icon fields on one document never share a drawer
  const drawerSlug = useDrawerSlug(`icon-picker-${path}`)

  // no visible tooltip on the field itself, so the accessible name carries the
  // icon it is set to
  const accessibleName = value ? `Icon: ${describeIcon(value)}. Change icon` : 'Select icon'

  return (
    <div className="field-type mt-auto">
      {showLabel && <FieldLabel label={field?.label} path={path} required={field?.required} />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => openModal(drawerSlug)}
          aria-label={accessibleName}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-(--theme-input-bg) transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {value ? (
            <Icon name={value as IconName} className="size-6 text-[24px]" />
          ) : (
            <span aria-hidden="true" className="text-xs text-muted-foreground">
              —
            </span>
          )}
        </button>

        {showInput && (
          <input
            type="text"
            value={value ?? ''}
            readOnly={readOnly}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. github or simple-icons:github"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}

        {showInput && !readOnly && (
          <Button
            buttonStyle="secondary"
            size="small"
            margin={false}
            onClick={() => openModal(drawerSlug)}
            aria-label="Browse icons"
          >
            Browse
          </Button>
        )}
      </div>

      {!readOnly && (
        <IconPickerDrawer
          slug={drawerSlug}
          value={value}
          prefix={prefix}
          onSelectAction={(icon) => setValue(icon)}
          onClearAction={() => setValue('')}
        />
      )}

      <FieldError showError={showError} message={errorMessage} path={path} />
    </div>
  )
}

export default IconFieldComponent

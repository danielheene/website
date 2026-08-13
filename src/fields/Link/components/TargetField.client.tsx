'use client'

import { type ComponentProps, type JSX, useCallback, useMemo, useState } from 'react'
import { createFilter } from 'react-select'
import type { RelationshipFieldClientProps } from 'payload'
import { FieldError, FieldLabel, fieldBaseClass, ReactSelect, useField } from '@payloadcms/ui'

import {
  type LinkTargetOption,
  type LinkTargetOptionGroup,
  linkTargetOptionValue,
} from '@/fields/Link/lib/fetchLinkTargetOptions'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { CUSTOM_URL_SLUG } from '@/fields/Link/lib/resolveLinkTarget'
import { siblingPath } from '@/fields/Link/lib/siblingPath'
import { cn } from '@/lib/cn'

type ReferenceValue = {
  relationTo: string
  value:
    | {
        id?: string
        title?: string
      }
    | string
} | null

type TargetFieldClientProps = RelationshipFieldClientProps & {
  optionGroups: LinkTargetOptionGroup[]
}

const CREATE_ERROR =
  'Enter an absolute http(s) URL, a mailto:/tel: link, a path starting with “/”, or a “#” anchor.'

const matchesSearch = createFilter<unknown>()

/**
 * Ordinary menu filtering, plus an escape hatch from a bug in Payload's
 * `ReactSelect` adapter.
 *
 * The adapter wires its own `onKeyDown` onto `CreatableSelect` *after*
 * spreading our props, so ours can never override it. That handler assumes
 * `isMulti`: with a value already selected and text typed, Enter/Tab runs
 * `onChange([...value, createOption(inputValue)])` — which throws
 * `TypeError: value is not iterable` on our single option object, and would
 * otherwise hand `handleChange` a bare `{ label, value }` carrying no
 * `__isNew__`, `relationTo` or `docID`.
 *
 * Its first guard is `if (filterOption && !filterOption(null, inputValue))
 * return`, and that probe is the *only* caller anywhere that passes a null
 * option — react-select's own `isFocusable` always passes
 * `{ label, value, data }`. Returning `false` for null therefore
 * short-circuits the broken branch and nothing else. It returns without
 * calling `preventDefault`, so react-select's own `onKeyDown` still runs and
 * selects the focused option; for typed text that is the "Create …" entry,
 * which reaches `handleChange` properly shaped as `__isNew__` and is validated
 * by `isValidCustomURL` like any other created option.
 *
 * The adapter forwards `filterOption` to `CreatableSelect` as well, so real
 * options keep react-select's default matching (which passes the synthetic
 * "Create …" option through untouched).
 */
const filterOption = (
  option: null | {
    data: unknown
    label: string
    value: string
  },
  search: string,
): boolean => option !== null && matchesSearch(option, search)

export const TargetFieldClient = ({
  field,
  optionGroups,
  path,
  readOnly,
}: TargetFieldClientProps): JSX.Element => {
  const [createError, setCreateError] = useState<null | string>(null)

  const {
    value: reference,
    setValue: setReference,
    showError,
    errorMessage,
  } = useField<ReferenceValue>({
    path,
  })

  const { value: url, setValue: setUrl } = useField<null | string>({
    path: siblingPath(path, 'url'),
  })

  const flatOptions = useMemo(
    () => optionGroups.flatMap((group) => group.options),
    [
      optionGroups,
    ],
  )

  /**
   * The option currently shown in the control. A stored reference that is
   * not in the preloaded list — deleted, or past LINK_TARGET_OPTION_LIMIT —
   * is synthesised from its populated value so the field reads as filled
   * rather than empty.
   */
  const selected = useMemo<LinkTargetOption | null>(() => {
    if (reference?.relationTo && reference.value) {
      const id =
        typeof reference.value === 'object' ? String(reference.value.id) : String(reference.value)
      const value = linkTargetOptionValue(reference.relationTo, id)
      const known = flatOptions.find((option) => option.value === value)

      if (known) return known

      const title = typeof reference.value === 'object' ? reference.value.title : undefined

      return {
        label: title || id,
        value,
        relationTo: reference.relationTo,
        docID: id,
      }
    }

    if (url) {
      return {
        label: url,
        value: linkTargetOptionValue(CUSTOM_URL_SLUG, url),
        relationTo: CUSTOM_URL_SLUG,
        docID: url,
      }
    }

    return null
  }, [
    flatOptions,
    reference,
    url,
  ])

  const handleChange = useCallback(
    (option: unknown) => {
      const next = option as
        | (LinkTargetOption & {
            __isNew__?: boolean
          })
        | null

      if (!next) {
        setReference(null)
        setUrl(null)
        setCreateError(null)
        return
      }

      // A created option carries react-select's default shape, where both
      // `label` and `value` are the raw typed string.
      if (next.__isNew__ || next.relationTo === CUSTOM_URL_SLUG) {
        const candidate = String(next.__isNew__ ? next.value : next.docID).trim()

        if (!isValidCustomURL(candidate)) {
          setCreateError(CREATE_ERROR)
          return
        }

        setReference(null)
        setUrl(candidate)
        setCreateError(null)
        return
      }

      setUrl(null)
      setReference({
        relationTo: next.relationTo,
        value: next.docID,
      })
      setCreateError(null)
    },
    [
      setReference,
      setUrl,
    ],
  )

  const hasError = showError || createError !== null
  const inputId = `field-${path.replace(/\./g, '__')}`

  return (
    <div
      className={cn(fieldBaseClass, 'relationship', hasError && 'error', readOnly && 'read-only')}
    >
      {/*
        `FieldLabel` derives its own `htmlFor` as `field-<path>-<editDepth>-<uuid>`
        when none is passed, which can never match the id we hand the control —
        so pass ours explicitly or the label names nothing.
      */}
      <FieldLabel htmlFor={inputId} label={field?.label} path={path} required={field?.required} />

      <ReactSelect
        isClearable
        isCreatable
        disabled={readOnly}
        filterOption={filterOption}
        inputId={inputId}
        onChange={handleChange}
        options={optionGroups}
        placeholder="Select a document, or type a URL to link somewhere else"
        showError={hasError}
        /*
          Deliberately `null`, not `undefined`. react-select's `useStateManager`
          resolves `value = propsValue !== undefined ? propsValue : stateValue`,
          so `undefined` hands the displayed value to react-select's internal
          state — a custom URL we rejected would keep showing in the control
          next to its own error. The adapter's prop type omits `null`, hence
          the cast.
        */
        value={selected as ComponentProps<typeof ReactSelect>['value']}
      />

      <FieldError message={createError ?? errorMessage} path={path} showError={hasError} />
    </div>
  )
}

export default TargetFieldClient

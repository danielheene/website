'use client'

import { type JSX, useCallback, useMemo, useState } from 'react'
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

  return (
    <div className={cn(fieldBaseClass, 'relationship', hasError && 'error')}>
      <FieldLabel label={field?.label} path={path} required />

      <ReactSelect
        isClearable
        isCreatable
        disabled={readOnly}
        inputId={`field-${path.replace(/\./g, '__')}`}
        onChange={handleChange}
        options={optionGroups}
        placeholder="Select a document, or type a URL to link somewhere else"
        showError={hasError}
        value={selected ?? undefined}
      />

      <FieldError message={createError ?? errorMessage} path={path} showError={hasError} />
    </div>
  )
}

export default TargetFieldClient

'use client'

import { type JSX, useMemo } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useFormFields } from '@payloadcms/ui'

import { deriveLinkTitle } from '@/fields/Link/lib/deriveLinkTitle'
import {
  type LinkTargetOptionGroup,
  linkTargetOptionValue,
} from '@/fields/Link/lib/fetchLinkTargetOptions'
import { resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { siblingPath } from '@/fields/Link/lib/siblingPath'
import FieldComponentClient from '@/fields/Template/Components/FieldComponent.client'

type LabelFieldClientProps = TextFieldClientProps & {
  optionGroups: LinkTargetOptionGroup[]
}

/**
 * The link label, edited as a pupa template.
 *
 * Reuses the template field's client component wholesale and changes only
 * where its `data` comes from: server props resolved once become live form
 * state, so the rendered preview follows the target select as the editor
 * changes it.
 */
export const LabelFieldClient = ({
  optionGroups,
  path,
  ...rest
}: LabelFieldClientProps): JSX.Element => {
  const referencePath = siblingPath(path, 'reference')
  const urlPath = siblingPath(path, 'url')

  const reference = useFormFields(([fields]) => fields[referencePath]?.value)
  const url = useFormFields(([fields]) => fields[urlPath]?.value)

  /**
   * Form state holds an unpopulated reference, so the title comes from the
   * preloaded option list rather than from the value itself. Falls through
   * to `deriveLinkTitle` for the custom-URL branch.
   */
  const title = useMemo(() => {
    const typed = reference as
      | {
          relationTo?: string
          value?: string
        }
      | null
      | undefined

    if (typed?.relationTo && typed.value) {
      const value = linkTargetOptionValue(typed.relationTo, String(typed.value))
      const option = optionGroups
        .flatMap((group) => group.options)
        .find((candidate) => candidate.value === value)

      if (option) return option.label
    }

    return deriveLinkTitle(
      resolveLinkTarget({
        url: typeof url === 'string' ? url : null,
      }),
    )
  }, [
    optionGroups,
    reference,
    url,
  ])

  return (
    <FieldComponentClient
      {...rest}
      path={path}
      data={{
        title,
      }}
      annotations={[
        {
          label: 'Link Data',
          entries: {
            '{title}': 'Title of the linked document, or the hostname of a custom URL',
          },
        },
      ]}
    />
  )
}

export default LabelFieldClient

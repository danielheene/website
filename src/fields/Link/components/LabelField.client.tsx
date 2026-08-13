'use client'

import { type JSX, useMemo } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useFormFields } from '@payloadcms/ui'

import type { LinkTargetOptionGroup } from '@/fields/Link/lib/fetchLinkTargetOptions'
import { resolveTitleFromOptions } from '@/fields/Link/lib/resolveTitleFromOptions'
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

  const title = useMemo(
    () => resolveTitleFromOptions(optionGroups, reference, url),
    [
      optionGroups,
      reference,
      url,
    ],
  )

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

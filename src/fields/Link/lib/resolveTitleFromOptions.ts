import type { LinkFieldData } from '@/types/payload'

import { deriveLinkTitle } from './deriveLinkTitle'
import { type LinkTargetOptionGroup, linkTargetOptionValue } from './fetchLinkTargetOptions'
import { resolveLinkTarget } from './resolveLinkTarget'

type ReferenceValue = {
  relationTo?: string
  value?:
    | {
        id?: string
        title?: string
      }
    | string
} | null

/**
 * The value bound to `{title}` while editing a link label.
 *
 * Live form state holds a reference that may be either populated (`{ id,
 * title }`, as loaded from the server) or a bare id (as written by the target
 * select), so both shapes have to yield the same id — see
 * `TargetField.client.tsx`, which makes the same distinction to decide what
 * to show in the control.
 *
 * A reference in the preloaded option list contributes that option's label:
 * it is the freshest title available, and an unpopulated id carries no title
 * of its own. Anything else — a document past `LINK_TARGET_OPTION_LIMIT`, a
 * deleted one, or a custom URL — falls through to `deriveLinkTitle` over
 * `resolveLinkTarget`, so the preview follows the same precedence the saved
 * label will (reference before url) rather than diverging from it.
 */
export const resolveTitleFromOptions = (
  optionGroups: LinkTargetOptionGroup[],
  reference: unknown,
  url: unknown,
): string => {
  const typed = reference as ReferenceValue | undefined

  if (typed?.relationTo && typed.value) {
    const id = typeof typed.value === 'object' ? String(typed.value.id) : String(typed.value)
    const value = linkTargetOptionValue(typed.relationTo, id)
    const option = optionGroups
      .flatMap((group) => group.options)
      .find((candidate) => candidate.value === value)

    if (option) return option.label
  }

  return deriveLinkTitle(
    resolveLinkTarget({
      reference: (typed ?? null) as LinkFieldData['reference'],
      url: typeof url === 'string' ? url : null,
    }),
  )
}

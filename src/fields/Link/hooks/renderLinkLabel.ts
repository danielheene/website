import type { FieldHook, TypeWithID } from 'payload'

import { deriveLinkTitle } from '@/fields/Link/lib/deriveLinkTitle'
import { resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { renderTemplateCore } from '@/lib/renderTemplate.core'
import type { LinkFieldData } from '@/types/payload'

/**
 * Renders the stored `label` template into the virtual `resolvedLabel`.
 *
 * Runs on every read rather than at save time on purpose: that is what keeps
 * `{title}` in step with the target document's actual title after a rename.
 *
 * A render failure degrades to the raw template rather than to an empty
 * label — a visible `{title}` is a far better signal than a link that
 * silently loses its text.
 */
export const renderLinkLabel: FieldHook<TypeWithID, string> = async ({ req, siblingData }) => {
  const link = siblingData as Partial<LinkFieldData> | undefined
  const template = typeof link?.label === 'string' ? link.label : ''

  if (!template) return ''

  const title = deriveLinkTitle(resolveLinkTarget(link))

  const { result, error } = await renderTemplateCore({
    template,
    data: {
      title,
    },
    // `renderTemplateCore` defaults `locale` to 'en' independently of the
    // request — omitting this would render English text into a German
    // document. `req.locale` carries the locale this read is actually for;
    // `'all'` (a locale-query sentinel, not a real locale) falls back to the
    // default.
    locale: req?.locale && req.locale !== 'all' ? req.locale : undefined,
    req,
  })

  if (error !== null) {
    req?.payload?.logger?.error(
      {
        err: error,
        template,
      },
      'Failed to render link label template',
    )

    return template
  }

  return result
}

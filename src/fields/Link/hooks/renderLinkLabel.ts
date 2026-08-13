import type { CollectionSlug, FieldHook, PayloadRequest, TypeWithID } from 'payload'

import { deriveLinkTitle } from '@/fields/Link/lib/deriveLinkTitle'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { renderTemplateCore } from '@/lib/renderTemplate.core'
import type { LinkFieldData } from '@/types/payload'

const TITLE_CONTEXT_KEY = 'renderLinkLabelTitle'

/**
 * Title of a referenced document, fetched by id and memoised on `req.context`
 * for the lifetime of the request — the same shape as
 * `renderTemplate.core`'s `loadTemplateGlobals`, and for the same reason: a
 * page holding N links to the same document would otherwise cost N reads.
 *
 * The in-flight promise is what gets cached, so links resolved concurrently
 * (the normal case — `afterRead` fans out across the whole document) share a
 * single query rather than racing to start their own.
 */
const loadReferenceTitle = async (
  relationTo: string,
  id: number | string,
  req: PayloadRequest,
  draft: boolean | undefined,
): Promise<string> => {
  const cacheKey = `${TITLE_CONTEXT_KEY}:${relationTo}:${id}`
  const cached = req.context?.[cacheKey] as Promise<string> | undefined

  if (cached) return cached

  const pending = (async () => {
    const doc = await req.payload.findByID({
      collection: relationTo as CollectionSlug,
      id,
      depth: 0,
      select: {
        title: true,
      },
      // The local API defaults `overrideAccess` to `true`, which would make
      // this fallback *more* permissive than the relationship population it
      // stands in for: population honours the collection's `read` access, so
      // an unpublished page stays unpopulated (and title-less) for anonymous
      // readers. Without this the title would leak into the rendered label.
      overrideAccess: false,
      // Access is evaluated from the acting user — `authenticatedOrPublished`
      // reads `req.user` — so the caller's identity has to travel with the
      // read. Passing `req` alone already carries it; naming it keeps the
      // dependency explicit and survives a future local-req rebuild.
      user: req.user,
      // A denied read is routine here, not a fault: degrade to "no document"
      // instead of throwing and logging as if something broke.
      disableErrors: true,
      // Population resolves drafts when the read is a draft read; mirror that
      // so admin/live-preview sees the draft title rather than the published
      // one. Payload hands `draft` to the hook as a sibling of `req` (see
      // `FieldHookArgs`), not as a property of the request — reading it off
      // `req` would always be `undefined`. `undefined` leaves the local API's
      // own default in place.
      draft,
      req,
    })

    const title = (
      doc as {
        title?: unknown
      } | null
    )?.title

    return typeof title === 'string' ? title : ''
  })()

  if (req.context) {
    req.context[cacheKey] = pending
    // A rejected lookup must not leave a permanently poisoned cache entry:
    // evict it so the next caller retries instead of re-throwing forever.
    pending.catch(() => {
      if (req.context?.[cacheKey] === pending) delete req.context[cacheKey]
    })
  }

  return pending
}

/**
 * `{title}` for this link.
 *
 * Payload runs field-level `afterRead` hooks *before* relationship
 * population (`fields/hooks/afterRead/index.ts` awaits the field promises,
 * then the population promises, per depth level), so `reference.value` is
 * still a bare id on most reads and `deriveLinkTitle` has nothing to read.
 * When that happens the document is fetched directly.
 *
 * A failed lookup — a deleted target, a permissions error — degrades to an
 * empty title rather than propagating: the label still renders, just without
 * its substitution.
 */
const resolveTitle = async (
  link: Partial<LinkFieldData> | undefined,
  req: PayloadRequest | undefined,
  draft: boolean | undefined,
): Promise<string> => {
  const target = resolveLinkTarget(link)

  if (!target) return ''

  const title = deriveLinkTitle(target)

  if (title || target.relationTo === CUSTOM_URL_SLUG) return title

  const { value } = target

  if (typeof value === 'object' || !req?.payload?.findByID) return ''

  try {
    return await loadReferenceTitle(target.relationTo, value, req, draft)
  } catch (error) {
    req.payload?.logger?.error(
      {
        err: error,
        collection: target.relationTo,
        id: value,
      },
      'Failed to resolve the link reference title',
    )

    return ''
  }
}

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
export const renderLinkLabel: FieldHook<TypeWithID, string> = async ({
  draft,
  req,
  siblingData,
}) => {
  const link = siblingData as Partial<LinkFieldData> | undefined
  const template = typeof link?.label === 'string' ? link.label : ''

  if (!template) return ''

  const title = await resolveTitle(link, req, draft)

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

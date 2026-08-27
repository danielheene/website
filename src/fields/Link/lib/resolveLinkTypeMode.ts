/**
 * The effective edit-mode for a link's target: whether row 2 of `LinkField`
 * should show the relationship dropdown or the custom-URL text input.
 *
 * `linkType` is a new field — documents saved before it existed have no
 * value for it. Rather than migrating stored data, an unset (or invalid)
 * `linkType` is inferred from whichever of `doc`/`url` the document actually
 * has. Precedence: an explicit, valid `linkType` always wins; otherwise a
 * populated `doc` wins; otherwise a populated `url` implies `'custom'` mode;
 * otherwise this defaults to `'internal'` (this field's own default for new
 * documents). This mirrors `resolveLinkTarget`'s own `doc`-before-`url`
 * precedence, so the admin UI's inferred mode always agrees with which
 * target the frontend actually renders.
 *
 * This is a UI-only fallback. It does not write `linkType` back — the field
 * saves an explicit value the next time the document is edited and saved.
 */
export const resolveLinkTypeMode = (siblingData: {
  linkType?: unknown
  doc?: {
    relationTo?: unknown
    value?: unknown
  } | null
  url?: unknown
}): 'internal' | 'custom' => {
  if (siblingData?.linkType === 'internal' || siblingData?.linkType === 'custom') {
    return siblingData.linkType
  }

  if (siblingData?.doc?.relationTo && siblingData.doc?.value) {
    return 'internal'
  }

  return siblingData?.url ? 'custom' : 'internal'
}

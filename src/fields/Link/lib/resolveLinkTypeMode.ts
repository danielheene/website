/**
 * The effective edit-mode for a link's target: whether row 2 of `LinkField`
 * should show the relationship dropdown or the custom-URL text input.
 *
 * `linkType` is a new field — documents saved before it existed have no
 * value for it. Rather than migrating stored data, an unset (or invalid)
 * `linkType` is inferred from whichever of `reference`/`url` the document
 * actually has: a populated `url` implies `'url'` mode, anything else
 * defaults to `'reference'` (this field's own default for new documents).
 *
 * This is a UI-only fallback. It does not write `linkType` back — the field
 * saves an explicit value the next time the document is edited and saved.
 */
export const resolveLinkTypeMode = (siblingData: {
  linkType?: unknown
  url?: unknown
}): 'reference' | 'url' => {
  if (siblingData?.linkType === 'reference' || siblingData?.linkType === 'url') {
    return siblingData.linkType
  }

  return siblingData?.url ? 'url' : 'reference'
}

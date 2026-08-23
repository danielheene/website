/**
 * The effective edit-mode for a link's target: whether row 2 of `LinkField`
 * should show the relationship dropdown or the custom-URL text input.
 *
 * `linkType` is a new field — documents saved before it existed have no
 * value for it. Rather than migrating stored data, an unset (or invalid)
 * `linkType` is inferred from whichever of `reference`/`url` the document
 * actually has. Precedence: an explicit, valid `linkType` always wins;
 * otherwise a populated `reference` wins; otherwise a populated `url`
 * implies `'url'` mode; otherwise this defaults to `'reference'` (this
 * field's own default for new documents). This mirrors `resolveLinkTarget`'s
 * own `reference`-before-`url` precedence, so the admin UI's inferred mode
 * always agrees with which target the frontend actually renders.
 *
 * This is a UI-only fallback. It does not write `linkType` back — the field
 * saves an explicit value the next time the document is edited and saved.
 */
export const resolveLinkTypeMode = (siblingData: {
  linkType?: unknown
  reference?: unknown
  url?: unknown
}): 'reference' | 'url' => {
  if (siblingData?.linkType === 'reference' || siblingData?.linkType === 'url') {
    return siblingData.linkType
  }

  if (siblingData?.reference) {
    return 'reference'
  }

  return siblingData?.url ? 'url' : 'reference'
}

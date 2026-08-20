import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/**
 * Unsplash's API guidelines require crediting the photographer and Unsplash,
 * each linking back with the app's UTM params attached
 * (https://help.unsplash.com/en/articles/2511315).
 */
const UTM_PARAMS = 'utm_source=heene_io&utm_medium=referral'

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  text,
})

/**
 * A link node for the `caption` editor variant.
 *
 * ## `fields` is flat (validation layer)
 *
 * The `caption` variant configures `LinkFeature({ fields: [...LinkField().fields] })`
 * (see `src/fields/RichText/index.ts:113-118`). Passing an *array* to
 * `LinkFeature`'s `fields` makes lexical's `transformExtraFields`
 * (`@payloadcms/richtext-lexical/dist/features/link/server/transformExtraFields.js`)
 * **replace** the default `linkType`/`url`/`newTab` base fields rather than
 * merge with them, so the real, validated schema for a link node's `fields`
 * object is `LinkField()`'s own flat field list: `reference`, `newTab`, `url`,
 * `iconBefore`, `label`, `iconAfter`, `resolvedLabel`, `iconOnly`. There is no
 * `linkType` field, and crucially no `link` sub-key — the `...` spread takes
 * the group's *inner* fields, not the `link` group itself.
 *
 * This is also what a human-authored link produces: the floating link editor's
 * `handleDrawerSubmit`
 * (`.../features/link/client/plugins/floatingLinkEditor/LinkEditor/index.js:301-331`)
 * passes the drawer form's reduced values straight through as
 * `$createLinkNode({ fields })` / `TOGGLE_LINK_COMMAND { fields }`, and those
 * values are keyed by this same flat schema. `migrateLinkFields.test.ts:77-109`
 * encodes the same flat-`fields` shape for lexical link nodes.
 *
 * `reference` is set explicitly to `null` so the key exists: `reference`'s
 * validator accepts an empty value as long as a sibling `url` is set.
 * `label` is `required: true`; omitting it silently resolves to the `{title}`
 * default (see `creditsLinkValidation.test.ts`).
 *
 * ## `children` carries the visible text (render layer)
 *
 * Every Lexical→JSX link converter — Payload's own
 * (`.../converters/lexicalToJSX/converter/converters/link.js`) and this repo's
 * override in `src/components/RichText/index.tsx:72-115` — renders the anchor's
 * text from `nodesToJSX({ nodes: node.children })`, never from `fields.label`.
 * An earlier version of this file set `children: []` on the theory that
 * `CMSLink` prints `resolvedLabel || label`; `CMSLink` is not on this render
 * path (`RichText` renders a bare `<a>{children}</a>`), so empty children
 * produced an empty anchor. Verified by rendering this function's output
 * through `convertLexicalNodesToJSX` + `defaultJSXConverters`: with
 * `children: []` the output was `<a href="…"></a>`; with a text child it is
 * `<a href="…">Jane Doe</a>`. `label` is kept as well because it is a required
 * field of the validated schema and is what the admin link editor displays.
 */
const linkNode = (text: string, url: string) => ({
  type: 'link',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: {
    reference: null,
    url,
    newTab: true,
    label: text,
  },
  children: [
    textNode(text),
  ],
})

/**
 * Builds the Lexical value for a `MediaImages.credits` field crediting an
 * imported Unsplash photo: "Photo by {photographer} on Unsplash", with both
 * names linking out per Unsplash's attribution requirements.
 */
export const buildCreditsValue = ({
  photographerName,
  photographerProfileUrl,
}: {
  photographerName: string
  photographerProfileUrl: string
}): DefaultTypedEditorState =>
  ({
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            textNode('Photo by '),
            linkNode(photographerName, `${photographerProfileUrl}?${UTM_PARAMS}`),
            textNode(' on '),
            linkNode('Unsplash', `https://unsplash.com/?${UTM_PARAMS}`),
          ],
        },
      ],
    },
  }) as unknown as DefaultTypedEditorState

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
 * ## `fields` is lexical's own stock shape (validation layer)
 *
 * `LinkFeature()` (see `src/fields/RichText/index.ts`) no longer swaps in
 * `LinkField`'s fields, so the validated schema for a link node's `fields`
 * object is lexical's own: `linkType`, `doc`, `url`, `newTab` — no `label`,
 * no icon fields. `linkType` here is always `'custom'`, since every credits
 * link is a custom URL, never a CMS document reference. `doc` is set
 * explicitly to `null` so the key exists, mirroring what the editor itself
 * writes for a custom-URL link.
 *
 * This is also what a human-authored link produces: the floating link
 * editor's `handleDrawerSubmit`
 * (`.../features/link/client/plugins/floatingLinkEditor/LinkEditor/index.js:301-331`)
 * passes the drawer form's reduced values straight through as
 * `$createLinkNode({ fields })` / `TOGGLE_LINK_COMMAND { fields }`, and those
 * values are keyed by this same stock schema.
 *
 * ## `children` carries the visible text (render layer)
 *
 * Every Lexical→JSX link converter — Payload's own
 * (`.../converters/lexicalToJSX/converter/converters/link.js`) and this
 * repo's override in `src/components/RichText/linkConverter.tsx` — renders
 * the anchor's text from `nodesToJSX({ nodes: node.children })`, never from
 * a `label` field (which doesn't exist on this shape). `children: []` would
 * produce an empty `<a href="…"></a>`; a text child produces
 * `<a href="…">Jane Doe</a>`.
 */
const linkNode = (text: string, url: string) => ({
  type: 'link',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: {
    linkType: 'custom',
    doc: null,
    url,
    newTab: true,
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

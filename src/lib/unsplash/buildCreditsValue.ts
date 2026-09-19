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
 * ## `fields` matches `linkFeatureFields`, not lexical's stock shape
 *
 * `LinkFeature()` (see `src/fields/RichText/index.ts`) swaps in
 * `linkFeatureFields` (from `src/fields/Link/index.ts`) as this node's
 * validated `fields` schema — the same rows a standalone `LinkField` uses,
 * minus the icon fields. That schema requires `text` (the row-3 "Label"
 * field, `required: true`) alongside `linkType`/`doc`/`url`/`newTab`; a link
 * node missing `text` fails Payload's own field validation the moment it is
 * saved. `linkType` here is always `'custom'`, since every credits link is a
 * custom URL, never a CMS document reference. `doc` is set explicitly to
 * `null` so the key exists, mirroring what the editor itself writes for a
 * custom-URL link.
 *
 * `fields.text` is validation-only — nothing renders it (see `children`
 * below) — so it is set to the same visible text as a real editor-authored
 * link would carry, and never diverges from it.
 *
 * ## `children` carries the visible text (render layer)
 *
 * Every Lexical→JSX link converter — Payload's own
 * (`.../converters/lexicalToJSX/converter/converters/link.js`) and this
 * repo's override in `src/components/RichText/linkConverter.tsx` — renders
 * the anchor's text from `nodesToJSX({ nodes: node.children })`, never from
 * `fields.text`. `children: []` would produce an empty `<a href="…"></a>`; a
 * text child produces `<a href="…">Jane Doe</a>`.
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
    text,
  },
  children: [
    textNode(text),
  ],
})

/**
 * Builds the Lexical value for a `MediaImages.credits` field crediting an
 * imported Unsplash photo: "{photographer} [Unsplash]", both the
 * photographer's name and "Unsplash" linking out per Unsplash's attribution
 * requirements. Deliberately terse — no "Photo by … on …" connective text.
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
            linkNode(photographerName, `${photographerProfileUrl}?${UTM_PARAMS}`),
            textNode(' ['),
            linkNode('Unsplash', `https://unsplash.com/?${UTM_PARAMS}`),
            textNode(']'),
          ],
        },
      ],
    },
  }) as unknown as DefaultTypedEditorState

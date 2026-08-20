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
 * The `caption` variant configures `LinkFeature({ fields: [...LinkField().fields] })`
 * (see `src/fields/RichText/index.ts`). Passing an *array* to `LinkFeature`'s
 * `fields` makes lexical's `transformExtraFields` **replace** the default
 * `linkType`/`url`/`newTab` base fields rather than merge with them, so the
 * real, validated schema for a link node's `fields` object is `LinkField()`'s
 * own flat field list: `reference`, `newTab`, `url`, `iconBefore`, `label`,
 * `iconAfter`, `resolvedLabel`, `iconOnly`. There is no `linkType` field.
 *
 * `label` is `required: true` and is what actually renders as the link text —
 * `CMSLink` prints `resolvedLabel || label` and *then* the node's children, so
 * the children are left empty to avoid printing the text twice. This matches
 * the shape `migrateLinkFields` migrates lexical link nodes into.
 *
 * `reference` is set explicitly to `null` so the key exists: `reference`'s
 * validator accepts an empty value as long as a sibling `url` is set.
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
  children: [],
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

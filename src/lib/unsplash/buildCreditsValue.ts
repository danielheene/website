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

const linkNode = (text: string, url: string) => ({
  type: 'link',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: {
    linkType: 'custom',
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

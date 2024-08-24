import { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { CallToAction } from '../CallToAction'

export const TeaserBlock: Block = {
  slug: 'teaserBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          ParagraphFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          LinkFeature(),
          BlocksFeature({
            inlineBlocks: [CallToAction],
          }),
        ],
      }),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

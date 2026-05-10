import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import type { RichTextField as PayloadRichTextField } from 'payload'
import { deepMerge } from 'payload'

import { LinkField } from '@/fields/Link'
import { BlockSlug } from '@/types/blocks'

const inlineFeatures = [
  /* text feature */
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  StrikethroughFeature(),
]

const captionFeatures = [
  ...inlineFeatures,
  LinkFeature({
    fields: [
      LinkField(),
    ],
  }),
]

const markdownFeatures = [
  ...captionFeatures,
  ParagraphFeature(),
  HeadingFeature({
    enabledHeadingSizes: [
      'h2',
      'h3',
      'h4' /* 'h5', */ /* 'h6' */,
    ],
  }),
  OrderedListFeature(),
  UnorderedListFeature(),
  ChecklistFeature(),
  BlockquoteFeature(),
  InlineCodeFeature(),
  UploadFeature(),
]

const postFeatures = [
  ...markdownFeatures,
  RelationshipFeature(),
  UploadFeature(),
  HorizontalRuleFeature(),
  BlocksFeature({
    blocks: [
      BlockSlug.LinkGroup,
      BlockSlug.Code,
      BlockSlug.TwoColumnContent,
    ],
  }),
  IndentFeature(),
  AlignFeature(),
  EXPERIMENTAL_TableFeature(),
]

type RichTextEditorVariant = 'inline' | 'caption' | 'markdown' | 'post'
type RichTextFieldOverrides = Partial<
  Omit<PayloadRichTextField, 'name' | 'type' | 'editor'>
>

type RichTextFieldProps = {
  name: string
  editorVariant?: RichTextEditorVariant
  overrides?: RichTextFieldOverrides
}

export const RichTextField = ({
  name,
  editorVariant = 'inline',
  overrides = {},
}: RichTextFieldProps): PayloadRichTextField => {
  const editor = createRichTextEditor(editorVariant)

  return deepMerge<PayloadRichTextField, RichTextFieldOverrides>(
    {
      type: 'richText',
      name,
      admin: {
        disableGroupBy: true,
        disableListFilter: true,
        disableListColumn: true,
        disableBulkEdit: true,
      },
      editor,
    },
    overrides,
  )
}

function createRichTextEditor(variant: RichTextEditorVariant) {
  if (variant === 'inline') {
    return lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        ...inlineFeatures,
      ],
    })
  }
  if (variant === 'caption') {
    return lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        ...captionFeatures,
      ],
    })
  }
  if (variant === 'markdown') {
    return lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        ...markdownFeatures,
      ],
    })
  }
  if (variant === 'post') {
    return lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        ...postFeatures,
      ],
    })
  }
}

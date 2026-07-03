import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
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

const rootFeatures = [
  FixedToolbarFeature({
    applyToFocusedEditor: true,
    customGroups: {
      /**
       * text:
       * paragraph, headings, ordered list, unordered list, check list, blockquote
       */
      text: {
        type: 'dropdown',
        order: 10,
      },

      /**
       * format:
       * bold, italic, underline, strikethrough, superscript, subscript, inline code
       */
      format: {
        type: 'buttons',
        order: 20,
      },

      /**
       * alignment:
       * left, center, right, justify
       */
      align: {
        type: 'buttons',
        order: 30,
      },

      /**
       * indentation:
       * increase, decrease
       */
      indent: {
        type: 'buttons',
        order: 40,
      },

      /**
       * features:
       * links, blockquote, hr, code */
      features: {
        type: 'buttons',
        order: 40,
      },

      /**
       * custom blocks:
       */
      add: {
        type: 'dropdown',
        order: 50,
      },
    },
    disableIfParentHasFixedToolbar: true,
  }),

  InlineToolbarFeature(),
]

const inlineFeatures = [
  ...rootFeatures,
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
      'h4',
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
      features: inlineFeatures,
      lexical: {
        // disableEvents: true,
        namespace: 'de',
        theme: {
          blockCursor: '',
          characterLimit: '',
          code: '',
          codeHighlight: undefined,
          hashtag: '',
          specialText: '',
          heading: {
            h1: '',
            h2: '',
            h3: '',
            h4: '',
            h5: '',
            h6: '',
          },
          hr: '',
          hrSelected: '',
          image: '',
          link: '',
          list: {
            ul: '',
            ulDepth: [],
            ol: '',
            olDepth: [],
            checklist: '',
            listitem: '',
            listitemChecked: '',
            listitemUnchecked: '',
            nested: {
              list: '',
              listitem: '',
            },
          },
          ltr: '',
          mark: '',
          markOverlap: '',
          paragraph: '',
          quote: '',
          root: '',
          rtl: '',
          tab: '',
          table: '',
          tableAddColumns: '',
          tableAddRows: '',
          tableCellActionButton: '',
          tableCellActionButtonContainer: '',
          tableCellSelected: '',
          tableCell: '',
          tableCellHeader: '',
          tableCellResizer: '',
          tableRow: '',
          tableScrollableWrapper: '',
          tableSelected: '',
          tableSelection: '',
          text: {
            base: '',
            bold: '',
            code: '',
            highlight: '',
            italic: '',
            lowercase: '',
            uppercase: '',
            capitalize: '',
            strikethrough: '',
            subscript: '',
            superscript: '',
            underline: '',
            underlineStrikethrough: '',
          },
          embedBlock: {
            base: '',
            focus: '',
          },
          indent: '',
        },
      },
      admin: {
        hideGutter: true,
        hideInsertParagraphAtEnd: true,
        hideDraggableBlockElement: true,
        hideAddBlockButton: true,
        placeholder: ' ',
      },
    })
  }
  if (variant === 'caption') {
    return lexicalEditor({
      features: captionFeatures,

      admin: {
        hideGutter: true,
        hideInsertParagraphAtEnd: true,
        hideDraggableBlockElement: true,
        hideAddBlockButton: true,
        placeholder: ' ',
      },
    })
  }
  if (variant === 'markdown') {
    return lexicalEditor({
      features: markdownFeatures,
    })
  }
  if (variant === 'post') {
    return lexicalEditor({
      features: postFeatures,
    })
  }
}

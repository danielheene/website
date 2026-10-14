import type { RichTextField as PayloadRichTextField, RichTextAdapterProvider } from 'payload'
import { deepMerge } from 'payload'
import {
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
  FeatureProviderServer,
  AlignFeature,
} from '@payloadcms/richtext-lexical'

import { cn } from 'tailwind-variants'
import { OmitDeep } from 'type-fest'

import { IconPickerFeature } from '@/fields/Icon/lexical/feature.server'
import { linkFeatureFields } from '@/fields/Link'
import { BlockSlug, BlockSlugValue } from '@/types/blocks'

export const RichTextEditorVariant = {
  Minimal: 'minimal',
  Caption: 'caption',
  Content: 'content',
  Post: 'post',
} as const

export type RichTextEditorVariant =
  (typeof RichTextEditorVariant)[keyof typeof RichTextEditorVariant]

export const RichTextFeatureSize = {
  Minimal: 0,
  Caption: 1,
  Content: 2,
  Post: 3,
} as const

export type RichTextFeatureSize = (typeof RichTextFeatureSize)[keyof typeof RichTextFeatureSize]

const getRichTextFeatureSize = (variant: RichTextEditorVariant): RichTextFeatureSize => {
  const index =
    Object.keys(RichTextEditorVariant)[Object.values(RichTextEditorVariant).indexOf(variant)]
  return index ? RichTextFeatureSize[index] : RichTextFeatureSize.Minimal
}

type ModifyBlocksFunc = (blocks: BlockSlugValue[]) => BlockSlugValue[]

export type RichTextFieldOverrides = Partial<
  OmitDeep<
    PayloadRichTextField,
    | 'name'
    | 'type'
    | 'editor'
    | 'admin.className'
    | 'admin.disableListColumn'
    | 'admin.disableListFilter'
    | 'admin.disableGroupBy'
    | 'admin.disableBulkEdit'
  >
>

type RichTextFieldProps = {
  name: string
  editorVariant?: RichTextEditorVariant
  modifyBlocks?: ModifyBlocksFunc
  modifyInlineBlocks?: ModifyBlocksFunc
  overrides?: RichTextFieldOverrides
}

export const RichTextField = ({
  name,
  editorVariant = RichTextEditorVariant.Minimal,
  modifyBlocks = (blocks) => blocks,
  modifyInlineBlocks = (inlineBlocks) => inlineBlocks,
  overrides = {},
}: RichTextFieldProps): PayloadRichTextField => {
  const featureSize = getRichTextFeatureSize(editorVariant)
  const editor = createRichTextEditor({ featureSize, modifyBlocks, modifyInlineBlocks })

  return deepMerge<PayloadRichTextField, RichTextFieldOverrides>(
    {
      type: 'richText',
      name,
      admin: {
        className: cn([
          'bg-(--theme-elevation-0)',
          String.raw`[&_.rich-text-lexical\_\_wrap_.fixed-toolbar]:top-0`,
          // String.raw`[&_.rich-text-lexical\_\_wrap_.fixed-toolbar]:border-[0_0_1px_0]`,
          String.raw`[&_.rich-text-lexical\_\_wrap]:h-full`,
          String.raw`[&_.rich-text-lexical\_\_wrap]:flex`,
          String.raw`[&_.rich-text-lexical\_\_wrap]:flex-col`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.fixed-toolbar]:min-h-auto`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.fixed-toolbar]:p-0.5`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.toolbar-popup\_\_button-alignJustify]:hidden`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.editor-container]:border`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.editor-container]:border-(--theme-elevation-150)`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.editor-container]:font-sans`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.editor-container]:h-full`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.editor-container]:grow`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.ContentEditable\_\_root]:p-2.5`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.ContentEditable\_\_root]:min-h-[120px]`,
          String.raw`[&_.rich-text-lexical\_\_wrap_.draggable-block-menu]:left-[30px]`,

          featureSize > RichTextFeatureSize.Caption && [
            String.raw`[&_.rich-text-lexical\_\_wrap_.ContentEditable\_\_root]:min-h-[500px]`,
          ],
        ]),
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

type CreateRichTextEditorOptions = {
  featureSize: RichTextFeatureSize
  modifyBlocks?: ModifyBlocksFunc
  modifyInlineBlocks?: ModifyBlocksFunc
}

function createRichTextEditor({
  featureSize,
  modifyBlocks,
  modifyInlineBlocks,
}: CreateRichTextEditorOptions): RichTextAdapterProvider {
  let features: FeatureProviderServer<unknown, unknown, unknown>[] = []

  if (featureSize >= RichTextFeatureSize.Minimal) {
    features = [
      ...features,
      FixedToolbarFeature({
        applyToFocusedEditor: true,
        customGroups: {
          // paragraph, headings, ordered/unordered/check list, blockquote
          text: {
            type: 'dropdown',
            order: 10,
            maxActiveItems: 1,
          },

          // bold, italic, underline, strikethrough, superscript, subscript, inline code
          format: {
            type: 'buttons',
            order: 20,
          },

          // left, center, right, justify
          align: {
            type: 'dropdown',
            order: 30,
          },

          // increase, decrease
          indent: {
            type: 'buttons',
            order: 40,
          },

          // links, blockquote, hr, code
          features: {
            type: 'buttons',
            order: 45,
          },

          // custom blocks
          add: {
            type: 'dropdown',
            order: 50,
          },

          blocks: {
            type: 'dropdown',
            order: 55,
          },
        },
        disableIfParentHasFixedToolbar: true,
      }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
    ]
  }

  if (featureSize >= RichTextFeatureSize.Caption) {
    features = [
      ...features,
      LinkFeature({
        fields: () => linkFeatureFields,
      }),
      IconPickerFeature(),
    ]
  }

  if (featureSize >= RichTextFeatureSize.Content) {
    features = [
      ...features,
      ParagraphFeature(),
      AlignFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h2', 'h3', 'h4'],
      }),
      OrderedListFeature(),
      UnorderedListFeature(),
      ChecklistFeature(),
      BlockquoteFeature(),
      InlineCodeFeature(),
      UploadFeature(),
    ]
  }

  if (featureSize >= RichTextFeatureSize.Post) {
    features = [
      ...features,
      RelationshipFeature(),
      HorizontalRuleFeature(),
      BlocksFeature({
        blocks: modifyBlocks([BlockSlug.LinkGroup, BlockSlug.Code, BlockSlug.HighlightBox]),
        inlineBlocks: modifyInlineBlocks([]),
      }),
      IndentFeature(),
      EXPERIMENTAL_TableFeature(),
    ]
  }

  return lexicalEditor({
    features,
    admin: {
      hideGutter: true,
      hideInsertParagraphAtEnd: true,
      hideAddBlockButton: true,
      placeholder: () => ' ',
      hideDraggableBlockElement: featureSize < RichTextFeatureSize.Content,
    },
  })
}

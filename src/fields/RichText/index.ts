import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { RichTextField as PayloadRichTextField } from 'payload'
import { deepMerge } from 'payload'

type RichTextEditorVariant = 'inline' | 'caption'
type RichTextFieldOverrides = Partial<Omit<PayloadRichTextField, 'name' | 'type' | 'editor'>>

type RichTextFieldProps = {
  name: string
  editorVariant?: RichTextEditorVariant
  overrides?: RichTextFieldOverrides
}

export const RichTextField = ({ name, editorVariant = 'inline', overrides = {} }: RichTextFieldProps): PayloadRichTextField => {
  const editor = createRichTextEditor(editorVariant)

  return deepMerge<PayloadRichTextField, RichTextFieldOverrides>(
    {
      type: 'richText',
      name,
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
        // ParagraphFeature(),
        // HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
        // BoldFeature(),
        // ItalicFeature(),
        // UnderlineFeature(),
        // IndentFeature(),
        //
        // OrderedListFeature(),
        // UnorderedListFeature(),
        // LinkFeature(),
        // FixedToolbarFeature({
        //   applyToFocusedEditor: true,
        //   customGroups: {
        //     text: {
        //       // paragraph, headings, lists
        //       type: 'dropdown',
        //       order: 10,
        //     },
        //     format: {
        //       // bold, italic, underline
        //       type: 'buttons',
        //       order: 20,
        //     },
        //     indent: {
        //       // indentations
        //       type: 'buttons',
        //       order: 30,
        //     },
        //     alignment: {
        //       type: 'buttons',
        //     },
        //     features: {
        //       // links, blockquote, hr, code
        //       type: 'buttons',
        //       order: 40,
        //     },
        //     ad: {
        //       // blocks
        //       type: 'dropdown',
        //       order: 50,
        //     },
        //   },
        //   disableIfParentHasFixedToolbar: true,
        // }),
        // InlineToolbarFeature(),
      ],
    })
  }
  if (variant === 'caption') {
    return lexicalEditor({
      features: ({ rootFeatures }) => [
        ...rootFeatures,
        // BoldFeature(),
        // ItalicFeature(),
        // UnderlineFeature(),
        // OrderedListFeature(),
        // UnorderedListFeature(),
        // ParagraphFeature(),
        // // BlockquoteFeature(),
        // LinkFeature(),
        // HorizontalRuleFeature(),
        // InlineCodeFeature(),
        // BlocksFeature({ blocks: [BlockSlug.LinkGroup, BlockSlug.TwoColumnContent] }),
        // FixedToolbarFeature({ disableIfParentHasFixedToolbar: true }),
      ],
    })
  }
}

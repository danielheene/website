import type { DefaultServerCellComponentProps, TextFieldClient } from 'payload'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'

import TitleCellClient from '@/collections/ResumeSkillTags/components/TitleCell.client'

type TitleCellProps = DefaultServerCellComponentProps<TextFieldClient, string>

/** Keeps the inline editor's single paragraph inline so the cell stays one flowing line. */
const inlineConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => (
    <span>
      {nodesToJSX({
        nodes: node.children,
      })}
    </span>
  ),
})

/**
 * Renders the skill's English content instead of the plain-text `title`, so
 * bold passages show in the list view.
 */
export const TitleCell = ({ rowData, collectionSlug }: TitleCellProps) => {
  const content = (
    rowData.content as
      | {
          en?: SerializedEditorState
        }
      | undefined
  )?.en

  return (
    <TitleCellClient
      titleValue={
        content ? (
          <RichText data={content} converters={inlineConverters} disableContainer />
        ) : (
          '<No Content>'
        )
      }
      doc={JSON.parse(JSON.stringify(rowData))}
      docID={rowData.id}
      collectionSlug={collectionSlug}
    />
  )
}

export default TitleCell

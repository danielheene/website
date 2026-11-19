import { randomBytes } from 'node:crypto'

export type Block = {
  id?: string
  blockType?: string
  blockName?: string
  title?: string
  content?: {
    root?: {
      children?: unknown[]
    }
  }
  [key: string]: unknown
}

// Same 24-hex shape as the ids Payload gives blocks.
const newBlockId = () => randomBytes(12).toString('hex')

const textNode = (text: string) => ({
  type: 'text',
  text,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const headingNode = (text: string) => ({
  type: 'heading',
  tag: 'h2',
  children: [textNode(text)],
  direction: null,
  format: '',
  indent: 0,
  version: 1,
})

const rootNode = (children: unknown[]) => ({
  root: {
    type: 'root',
    children,
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
})

/**
 * Flattens a legal page's blocks into one Lexical document: rich-text blocks
 * contribute their nodes, every other block becomes an embedded block node,
 * and a block's old `title` becomes the h2 above it.
 */
export const blocksToLexical = (blocks: Block[]) => {
  const children = blocks.flatMap((block): unknown[] => {
    if (block.blockType === 'RichTextBlock') return block.content?.root?.children ?? []

    const { title, content: _content, ...fields } = block

    return [
      ...(title ? [headingNode(title)] : []),
      {
        type: 'block',
        version: 2,
        format: '',
        fields: {
          ...fields,
          id: block.id ?? newBlockId(),
          blockName: block.blockName ?? '',
        },
      },
    ]
  })

  return children.length > 0 ? rootNode(children) : null
}

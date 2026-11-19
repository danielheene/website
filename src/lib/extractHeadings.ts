import slugify from '@sindresorhus/slugify'

import { BlockSlug } from '@/types/blocks'

export interface ExtractedHeading {
  id: string
  title: string
  level: number
  /** `section` is a block's own title, `heading` a heading inside rich text. */
  kind: 'section' | 'heading'
  /** Index of the page block the entry belongs to, when extracted from a block list. */
  blockIndex?: number
}

export type HeadingIdGenerator = (title: string) => string

/**
 * Turns titles into unique anchor ids: slugified, with a numeric suffix for
 * repeats (`faq`, `faq-1`, …). Share one generator across everything rendered
 * on a page so ids never collide between blocks.
 */
export const createHeadingIdGenerator = (): HeadingIdGenerator => {
  const seen = new Map<string, number>()

  return (title) => {
    const base = slugify(title) || 'section'
    const count = seen.get(base) ?? 0

    seen.set(base, count + 1)

    return count === 0 ? base : `${base}-${count}`
  }
}

/** Concatenates the text of a Lexical node tree, ignoring non-text nodes. */
export const lexicalNodeText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const { type, text, children } = node as {
    type?: string
    text?: string
    children?: unknown[]
  }

  if (type === 'text' && typeof text === 'string') return text

  if (!Array.isArray(children)) return ''

  return children.map(lexicalNodeText).join('')
}

interface ExtractOptions {
  generateId?: HeadingIdGenerator
  /** Added to every rich-text heading level, to nest them under a block title. */
  levelOffset?: number
  blockIndex?: number
}

const extractLexicalHeadings = (
  data: unknown,
  {
    generateId,
    levelOffset = 0,
    blockIndex,
  }: Required<Pick<ExtractOptions, 'generateId'>> & ExtractOptions,
): ExtractedHeading[] => {
  const children = (
    data as {
      root?: {
        children?: unknown[]
      }
    }
  )?.root?.children

  if (!Array.isArray(children)) return []

  return children.flatMap((node) => {
    const { type, tag } = (node ?? {}) as {
      type?: string
      tag?: string
    }

    if (type !== 'heading' || !tag) return []

    const title = lexicalNodeText(node).trim()

    if (!title) return []

    return [
      {
        id: generateId(title),
        title,
        level: (Number.parseInt(tag.replace('h', ''), 10) || 2) + levelOffset,
        kind: 'heading' as const,
        blockIndex,
      },
    ]
  })
}

// The fields read from any page block; most blocks carry only some of them.
interface ExtractableBlock {
  title?: string | null
  blockType?: string
  content?: unknown
}

const extractBlockHeadings = (
  { title, blockType, content }: ExtractableBlock,
  blockIndex: number,
  generateId: HeadingIdGenerator,
): ExtractedHeading[] => {
  const headings: ExtractedHeading[] = []
  const blockTitle = title?.trim() ?? ''

  if (blockTitle) {
    headings.push({
      id: generateId(blockTitle),
      title: blockTitle,
      level: 1,
      kind: 'section',
      blockIndex,
    })
  }

  if (blockType === BlockSlug.RichText) {
    headings.push(
      ...extractLexicalHeadings(content, {
        generateId,
        levelOffset: blockTitle ? 1 : 0,
        blockIndex,
      }),
    )
  }

  return headings
}

/**
 * Collects the anchors of a Lexical document or of a page's block list, in
 * document order: a block's `title` becomes a level-1 `section`, and the
 * headings of a `RichTextBlock` follow it, one level deeper when the block has
 * a title.
 *
 * Pass a shared `generateId` when the ids must line up with other content
 * rendered on the same page; `RenderBlocks` relies on this to hand each block
 * the ids it renders.
 */
export const extractHeadings = (
  content: unknown,
  { generateId = createHeadingIdGenerator(), ...options }: ExtractOptions = {},
): ExtractedHeading[] => {
  if (Array.isArray(content)) {
    return content.flatMap((block: ExtractableBlock | null, index) =>
      extractBlockHeadings(block ?? {}, index, generateId),
    )
  }

  return extractLexicalHeadings(content, {
    generateId,
    ...options,
  })
}

export interface BlockAnchors {
  /** Id for the block's `SectionContainer`. */
  anchorId?: string
  /** Ids for the block's rich-text headings, in document order. */
  headingIds?: string[]
}

/** Splits extracted headings back into the anchor props each block renders. */
export const getBlockAnchors = (headings: ExtractedHeading[], blockIndex: number): BlockAnchors => {
  const own = headings.filter((heading) => heading.blockIndex === blockIndex)

  return {
    anchorId: own.find(({ kind }) => kind === 'section')?.id,
    headingIds: own.flatMap(({ kind, id }) => (kind === 'heading' ? [id] : [])),
  }
}

/** Anchor id for a single title rendered outside a shared extraction. */
export const createAnchorId = (title: string): string => createHeadingIdGenerator()(title)

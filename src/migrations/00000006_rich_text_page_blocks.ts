import { randomBytes } from 'node:crypto'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { CollectionSlug } from '@/types/collections'

const ONE_COLUMN = 'OneColumnContentBlock'
const TWO_COLUMN = 'TwoColumnContentBlock'
const RICH_TEXT = 'RichTextBlock'

type PageBlock = Record<string, unknown> & {
  blockType?: string
}

type LexicalNode = Record<string, unknown> & {
  type?: string
  fields?: Record<string, unknown>
}

const lexicalRoot = (children: LexicalNode[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children,
  },
})

/** Wraps a page-level two-column block into a Rich Text block holding it as a Lexical block. */
const wrapTwoColumn = ({ id, blockName, contentLeft, contentRight }: PageBlock): PageBlock => ({
  id,
  blockType: RICH_TEXT,
  content: lexicalRoot([
    {
      type: 'block',
      version: 2,
      format: '',
      fields: {
        id: randomBytes(12).toString('hex'),
        blockName: blockName ?? '',
        blockType: TWO_COLUMN,
        contentLeft,
        contentRight,
      },
    },
  ]),
})

/** The inverse of `wrapTwoColumn`, for a Rich Text block holding nothing but one two-column block. */
const unwrapTwoColumn = (block: PageBlock): PageBlock | undefined => {
  const children = (block.content as { root?: { children?: LexicalNode[] } })?.root?.children
  const [only] = children ?? []

  if (children?.length !== 1 || only.type !== 'block' || only.fields?.blockType !== TWO_COLUMN) {
    return undefined
  }

  return {
    id: block.id,
    blockType: TWO_COLUMN,
    contentLeft: only.fields.contentLeft,
    contentRight: only.fields.contentRight,
  }
}

const toRichText = (block: PageBlock): PageBlock => {
  if (block.blockType === ONE_COLUMN) return { ...block, blockType: RICH_TEXT }
  if (block.blockType === TWO_COLUMN) return wrapTwoColumn(block)
  return block
}

const fromRichText = (block: PageBlock): PageBlock => {
  if (block.blockType !== RICH_TEXT) return block
  return unwrapTwoColumn(block) ?? { ...block, blockType: ONE_COLUMN }
}

const convertPages = async (
  { payload, session }: MigrateUpArgs,
  from: string[],
  convert: (block: PageBlock) => PageBlock,
) => {
  const targets = [
    {
      model: payload.db.collections[CollectionSlug.Pages],
      prefix: '',
    },
    {
      model: payload.db.versions[CollectionSlug.Pages],
      prefix: 'version.',
    },
  ]

  for (const { model, prefix } of targets) {
    if (!model) continue

    const docs = await model.collection
      .find(
        {
          [`${prefix}content.blockType`]: {
            $in: from,
          },
        },
        {
          projection: {
            [`${prefix}content`]: 1,
          },
          session,
        },
      )
      .toArray()

    for (const doc of docs) {
      const content = ((prefix ? doc.version?.content : doc.content) ?? []) as PageBlock[]

      await model.collection.updateOne(
        {
          _id: doc._id,
        },
        {
          $set: {
            [`${prefix}content`]: content.map(convert),
          },
        },
        {
          session,
        },
      )
    }

    payload.logger.info(
      `[pages] converted content blocks in ${docs.length} document(s) in ${model.collection.collectionName}`,
    )
  }
}

/**
 * The One-Column Content page block is now the generic Rich Text block, and
 * two columns are a Lexical block inside its editor rather than a page block
 * of their own.
 *
 * - `OneColumnContentBlock` page blocks are renamed to `RichTextBlock`.
 * - `TwoColumnContentBlock` page blocks become a `RichTextBlock` whose content
 *   is that same two-column block, as a Lexical block node. Their columns keep
 *   their content as is: the column editors did not change.
 *
 * Covers pages and their versions. Updates go through the native driver
 * collections so no hooks or validation run.
 */
export async function up(args: MigrateUpArgs): Promise<void> {
  await convertPages(args, [ONE_COLUMN, TWO_COLUMN], toRichText)
}

/**
 * Restores both page blocks. A Rich Text block holding nothing but a
 * two-column block turns back into a page-level two-column block; any other
 * becomes a One-Column Content block again, even if it gained Lexical
 * two-column blocks since, which the old editor cannot load.
 */
export async function down(args: MigrateDownArgs): Promise<void> {
  await convertPages(args, [RICH_TEXT], fromRichText)
}

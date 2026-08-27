/**
 * Shared Lexical rich-text node builders and deterministic-random helpers
 * for seed/fixture content generation.
 *
 * Node shapes mirror what the Lexical editor actually persists (verified
 * against existing documents). Text formats are a bitmask — see IS_* below,
 * matching src/components/RichText/nodeFormat.tsx.
 *
 * Ported from scripts/seed-blog.ts, which is retired once BlogPosts/
 * BlogTopics move to this module (see docs/superpowers/plans/
 * 2026-08-20-blog-and-pages-seed-realism.md).
 */

export const IS_BOLD = 1
export const IS_ITALIC = 1 << 1
export const IS_STRIKETHROUGH = 1 << 2
export const IS_UNDERLINE = 1 << 3
export const IS_CODE = 1 << 4
export const IS_SUBSCRIPT = 1 << 5
export const IS_SUPERSCRIPT = 1 << 6

export type TextFormat = number

export const text = (value: string, format: TextFormat = 0) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
})

export type InlineNode = ReturnType<typeof text> | Record<string, unknown>

export const paragraph = (
  children: InlineNode[] | string,
  format: '' | 'center' | 'right' = '',
) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format,
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children:
    typeof children === 'string'
      ? [
          text(children),
        ]
      : children,
})

export const heading = (value: string, tag: 'h2' | 'h3' | 'h4' = 'h2') => ({
  type: 'heading',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  children: [
    text(value),
  ],
})

export const quote = (value: string) => ({
  type: 'quote',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [
    text(value),
  ],
})

/**
 * Link node using lexical's own stock link fields. `RichTextField`'s
 * `LinkFeature` (src/fields/RichText/index.ts) no longer swaps in
 * `LinkField`'s fields, so a link node's `fields` here is lexical's native
 * `{ linkType, doc, url, newTab }` shape — no `label`, no icon fields; the
 * link's visible text is just its `children`, same as a human selecting text
 * and clicking "link" in the editor. This helper always builds a custom-URL
 * link, so `linkType` is always `'custom'`.
 *
 * `doc` still has to be sent as `null` explicitly rather than omitted,
 * mirroring what the editor itself writes for a custom-URL link.
 */
export const link = (value: string, url: string) => ({
  type: 'link',
  version: 3,
  direction: 'ltr',
  format: '',
  indent: 0,
  fields: {
    linkType: 'custom',
    doc: null,
    newTab: true,
    url,
  },
  children: [
    text(value),
  ],
})

export const list = (
  items: (string | InlineNode[])[],
  listType: 'bullet' | 'number' | 'check',
) => ({
  type: 'list',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  listType,
  start: 1,
  tag: listType === 'number' ? 'ol' : 'ul',
  children: items.map((item, index) => ({
    type: 'listitem',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    value: index + 1,
    checked: listType === 'check' ? index % 2 === 0 : undefined,
    children:
      typeof item === 'string'
        ? [
            text(item),
          ]
        : item,
  })),
})

export const horizontalRule = () => ({
  type: 'horizontalrule',
  version: 1,
})

export const upload = (relationTo: 'images' | 'videos', value: string) => ({
  type: 'upload',
  version: 3,
  format: '',
  fields: null,
  relationTo,
  value,
})

export const codeBlock = (
  code: string,
  language: 'typescript' | 'javascript' | 'css' = 'typescript',
) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: {
    blockType: 'CodeBlock',
    blockName: '',
    code,
    language,
  },
})

/**
 * Wraps nodes in a Lexical root. Returned loosely typed — callers cast the
 * result to whichever field's generated rich-text type they're assigning it
 * to (e.g. `root(nodes) as unknown as OneColumnContentBlock['content']`).
 * Payload's generated rich-text type demands exact literal unions for
 * `direction`/`format` that every node builder above would otherwise have
 * to restate.
 */
export const root = (children: Record<string, unknown>[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children,
  },
})

/**
 * Seeded PRNG (mulberry32) so a given seed string always produces the same
 * sequence: reruns stay idempotent and diffs remain reviewable, while each
 * generated document still gets a distinct structure.
 */
export const createRandom = (seed: string) => {
  let hash = 1779033703 ^ seed.length
  for (let index = 0; index < seed.length; index++) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }

  let state = hash >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Random = ReturnType<typeof createRandom>

export const pick = <T>(random: Random, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]

export const pickSome = <T>(random: Random, items: readonly T[], count: number): T[] =>
  [
    ...items,
  ]
    .sort(() => random() - 0.5)
    .slice(0, count)

export const chance = (random: Random, probability: number) => random() < probability

import { generateSlug } from './generateSlug'

export interface ExtractedHeading {
  id: string
  title: string
  level: number
}

/** Concatenates the text of a Lexical node tree, ignoring non-text nodes. */
const nodeText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const { type, text, children } = node as {
    type?: string
    text?: string
    children?: unknown[]
  }

  if (type === 'text' && typeof text === 'string') return text
  if (!Array.isArray(children)) return ''

  return children.map(nodeText).join('')
}

/**
 * Collects the headings of a Lexical document so a table of contents can link
 * to them. IDs are slugified from the heading text and de-duplicated with a
 * numeric suffix, matching the ids the RichText heading converter renders.
 */
export const extractHeadings = (data: unknown): ExtractedHeading[] => {
  const children = (
    data as {
      root?: {
        children?: unknown[]
      }
    }
  )?.root?.children

  if (!Array.isArray(children)) return []

  const seen = new Map<string, number>()

  return children.reduce<ExtractedHeading[]>((headings, node) => {
    const { type, tag } = (node ?? {}) as {
      type?: string
      tag?: string
    }

    if (type !== 'heading' || !tag) return headings

    const title = nodeText(node).trim()
    if (!title) return headings

    const base = generateSlug(title)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)

    headings.push({
      id: count === 0 ? base : `${base}-${count}`,
      title,
      level: Number.parseInt(tag.replace('h', ''), 10) || 2,
    })

    return headings
  }, [])
}

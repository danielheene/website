/* oxlint-disable anti-slop/no-runtime-typeof, anti-slop/no-unknown-parameters, anti-slop/no-unsafe-dictionary-type -- walks arbitrary document JSON of any collection; there is no single schema to parse it against */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// The search-preview fields describe the document; they are not its content.
const SKIPPED_KEYS = new Set(['meta'])

/**
 * Collects the readable text of a Payload document: every `title` and every
 * Lexical text node, in document order, wherever they are nested (hero
 * slides, layout blocks, rich-text fields).
 *
 * Relationship fields only contribute when they are populated; a bare ID has
 * no text. Repeated strings are kept once.
 */
export const extractDocumentText = (document: unknown): string => {
  const parts: string[] = []
  const seen = new Set<string>()

  const add = (text: string) => {
    const trimmed = text.replace(/\s+/g, ' ').trim()

    if (trimmed === '' || seen.has(trimmed)) return

    seen.add(trimmed)
    parts.push(trimmed)
  }

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const item of node) visit(item)

      return
    }

    if (!isRecord(node)) return

    // A Lexical text node; its siblings and children hold no further text.
    if (node.type === 'text' && typeof node.text === 'string') {
      add(node.text)

      return
    }

    for (const [key, value] of Object.entries(node)) {
      if (SKIPPED_KEYS.has(key)) continue

      if (key === 'title' && typeof value === 'string') {
        add(value)
      } else {
        visit(value)
      }
    }
  }

  visit(document)

  return parts.join('\n')
}

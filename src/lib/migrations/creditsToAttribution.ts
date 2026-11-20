import { AttributionLicense } from '@/fields/Attribution/licenses'
import type { AttributionValue } from '@/lib/attribution'
import { hasLexicalText } from '@/lib/attribution'

type LinkCredit = {
  name: string
  url: string
}

type LexicalNode = {
  type?: unknown
  text?: unknown
  children?: unknown
  fields?: {
    url?: unknown
  }
}

const PLATFORM_LICENSES: [RegExp, AttributionLicense][] = [
  [/unsplash/i, AttributionLicense.Unsplash],
  [/pexels/i, AttributionLicense.Pexels],
  [/pixabay/i, AttributionLicense.Pixabay],
]

// what the old credit lines put around their links: "Photo by X on Y", "X [Y]", "by X auf Y"
const CONNECTIVES = /\b(photo|foto|image|bild|by|von|from|on|auf|via|at)\b|[[\]().,:·|/-]/gi

const textOf = (node: LexicalNode): string =>
  (typeof node.text === 'string' ? node.text : '') +
  (Array.isArray(node.children) ? node.children.map(textOf).join('') : '')

const collectLinks = (node: LexicalNode, links: LinkCredit[]): LinkCredit[] => {
  if (node.type === 'link' && typeof node.fields?.url === 'string') {
    const name = textOf(node).trim()

    if (name) links.push({ name, url: node.fields.url })

    return links
  }

  if (Array.isArray(node.children)) {
    // SAFETY: every child of a serialized Lexical node is itself a node.
    for (const child of node.children) collectLinks(child as LexicalNode, links)
  }

  return links
}

/**
 * Turns a media file's old `credits` rich text into the `attribution` group.
 * The credit lines all name the author first and the platform second, each
 * as a link, so the first two links become author and studio. Anything the
 * links don't cover, or a credit without links, stays as notes.
 */
export const creditsToAttribution = (credits: unknown): AttributionValue | null => {
  if (!hasLexicalText(credits)) return null

  // SAFETY: hasLexicalText checked that `credits` is an object with a `root` node.
  const root = (credits as { root: LexicalNode }).root
  const [author, studio] = collectLinks(root, [])

  let rest = textOf(root)

  for (const link of [author, studio]) {
    if (link) rest = rest.replace(link.name, ' ')
  }

  const keepsNotes = !author || rest.replace(CONNECTIVES, ' ').trim() !== ''
  const license = studio && PLATFORM_LICENSES.find(([pattern]) => pattern.test(studio.name))?.[1]

  return {
    ...(author && { authorName: author.name, authorURL: author.url }),
    ...(studio && { studioName: studio.name, studioURL: studio.url }),
    ...(license && { license }),
    ...(keepsNotes && { notes: credits }),
  }
}

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  text,
})

// `fields` matches linkFeatureFields, which requires `text` next to the URL
const linkNode = ({ name, url }: LinkCredit) => ({
  type: 'link',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: {
    linkType: 'custom',
    doc: null,
    url,
    newTab: true,
    text: name,
  },
  children: [textNode(name)],
})

const creditNodes = (name?: string | null, url?: string | null) =>
  name ? [url ? linkNode({ name, url }) : textNode(name)] : []

/** The reverse, for the down migration: notes if kept, else "Author [Studio]". */
export const attributionToCredits = (attribution: AttributionValue | null | undefined) => {
  if (!attribution) return null

  if (hasLexicalText(attribution.notes)) return attribution.notes

  const author = creditNodes(attribution.authorName, attribution.authorURL)
  const studio = creditNodes(attribution.studioName, attribution.studioURL)

  const children =
    author.length && studio.length
      ? [...author, textNode(' ['), ...studio, textNode(']')]
      : [...author, ...studio]

  if (children.length === 0) return null

  return {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          children,
        },
      ],
    },
  }
}

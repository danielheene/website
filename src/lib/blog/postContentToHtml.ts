import type { DefaultNodeTypes } from '@payloadcms/richtext-lexical'
import {
  convertLexicalToHTML,
  type HTMLConverter,
  type HTMLConvertersFunction,
} from '@payloadcms/richtext-lexical/html'
import type {
  SerializedEditorState,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'

import type { LinkFieldDataLean } from '@/fields/Link/lib/resolveLinkTarget'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { generateContentURL } from '@/lib/generateContentURL'
import { BlockSlug } from '@/types/blocks'
import { CollectionSlug } from '@/types/collections'

/**
 *    Post content → HTML, for syndication
 *
 *    Feed readers render the HTML out of context: relative URLs resolve
 *    against the reader, not this site, and there is no CSS or JS. So this
 *    mirrors the frontend `RichText` converters' output, but as plain,
 *    self-contained markup with every URL made absolute — no highlighting,
 *    no icons, no wrappers that only exist for styling.
 */

type RichTextData = SerializedEditorState | null | undefined

type NodeOf<T extends DefaultNodeTypes['type']> = Extract<
  DefaultNodeTypes,
  {
    type: T
  }
>

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHTML = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])

type UploadValue = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  thumbnails?: {
    value?: {
      url?: string | null
    } | null
  }[]
}

/** Resolves `url` against SERVER_URL; unparsable values are dropped. */
export const toAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  try {
    return new URL(url, process.env.SERVER_URL).toString()
  } catch {
    return null
  }
}

/**
 * Only http(s) and mailto links survive — the frontend renders these through
 * React, which refuses `javascript:` URLs; raw HTML in a feed gets no such
 * protection.
 */
const safeHref = (url: string | null | undefined): string | null => {
  const absolute = toAbsoluteUrl(url)
  if (!absolute) return null
  const { protocol } = new URL(absolute)
  return [
    'http:',
    'https:',
    'mailto:',
  ].includes(protocol)
    ? absolute
    : null
}

const linkHref = (fields: LinkFieldDataLean | undefined): string | null => {
  const target = resolveLinkTarget(fields)
  if (!target) return null

  if (target.relationTo === CUSTOM_URL_SLUG) return safeHref(target.value)

  // only a populated reference carries a slug; a bare id cannot become a URL
  return typeof target.value === 'object' && target.value.slug
    ? generateContentURL({
        collection: target.relationTo,
        slug: target.value.slug,
      })
    : null
}

const anchor = (href: string | null, children: string, newTab?: boolean | null): string =>
  href
    ? `<a href="${escapeHTML(href)}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`
    : children

const linkConverter: HTMLConverter<NodeOf<'link'>> = ({ node, nodesToHTML }) =>
  anchor(
    linkHref(node.fields as unknown as LinkFieldDataLean | undefined),
    nodesToHTML({
      nodes: node.children,
    }).join(''),
    node.fields?.newTab,
  )

const autolinkConverter: HTMLConverter<NodeOf<'autolink'>> = ({ node, nodesToHTML }) =>
  anchor(
    safeHref(node.fields?.url),
    nodesToHTML({
      nodes: node.children,
    }).join(''),
    node.fields?.newTab,
  )

/**
 * The frontend renders `images` and `videos` (the default converter only knows
 * Payload's built-in `media` collection). Anything else renders as nothing,
 * same as on the site.
 */
const uploadConverter: HTMLConverter<NodeOf<'upload'>> = ({ node }) => {
  const value = node.value as unknown as UploadValue | string | undefined
  if (!value || typeof value !== 'object') return ''

  const src = toAbsoluteUrl(value.url)
  if (!src) return ''

  const size = [
    value.width ? ` width="${escapeHTML(String(value.width))}"` : '',
    value.height ? ` height="${escapeHTML(String(value.height))}"` : '',
  ].join('')

  if (node.relationTo === CollectionSlug.MediaVideos) {
    const poster = toAbsoluteUrl(value.thumbnails?.[0]?.value?.url)
    return `<video src="${escapeHTML(src)}" controls preload="none"${
      poster ? ` poster="${escapeHTML(poster)}"` : ''
    }${size}></video>`
  }

  if (node.relationTo === CollectionSlug.MediaImages) {
    return `<img src="${escapeHTML(src)}" alt="${escapeHTML(value.alt ?? '')}"${size}/>`
  }

  return ''
}

/** Unwraps nodes that only matter on the site (and unknown ones) to their text. */
const passthroughConverter: HTMLConverter<
  SerializedLexicalNode & {
    children?: SerializedLexicalNode[]
  }
> = ({ node, nodesToHTML }) =>
  Array.isArray(node.children)
    ? nodesToHTML({
        nodes: node.children,
      }).join('')
    : ''

const converters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: linkConverter,
  autolink: autolinkConverter,
  upload: uploadConverter,
  // decorative inline icons from the IconPicker feature. Functions, not '' —
  // an empty-string converter is falsy and falls through to "unknown node"
  icon: () => '',
  // not rendered by the frontend either
  relationship: () => '',
  unknown: passthroughConverter,
  blocks: {
    [BlockSlug.Code]: ({ node }) => {
      const language = node.fields?.language
      return `<pre><code${
        language ? ` class="language-${escapeHTML(language)}"` : ''
      }>${escapeHTML(node.fields?.code ?? '')}</code></pre>`
    },
    // columns collapse to consecutive sections — a reader has no grid
    [BlockSlug.TwoColumnContent]: ({ node }) =>
      [
        node.fields?.contentLeft,
        node.fields?.contentRight,
      ]
        .map((column: RichTextData) => postContentToHtml(column))
        .filter(Boolean)
        .map((html) => `<div>${html}</div>`)
        .join(''),
    [BlockSlug.LinkGroup]: ({ node }) => {
      const items = (
        (node.fields?.links ?? []) as {
          link?: LinkFieldDataLean
        }[]
      )
        .map(({ link }) => {
          const href = linkHref(link)
          return href && link?.text
            ? `<li>${anchor(href, escapeHTML(link.text), link.newTab)}</li>`
            : ''
        })
        .filter(Boolean)

      return items.length > 0 ? `<ul>${items.join('')}</ul>` : ''
    },
  },
})

/**
 * Converts post rich text to feed-safe HTML. Expects relations (uploads,
 * internal links) to be populated — unpopulated ones are skipped rather than
 * emitted with a broken URL.
 */
export const postContentToHtml = (data: RichTextData): string => {
  if (!data?.root) return ''

  return convertLexicalToHTML({
    data,
    converters,
    disableContainer: true,
    disableIndent: true,
    disableTextAlign: true,
  }).trim()
}

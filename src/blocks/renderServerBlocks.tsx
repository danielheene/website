import { type ElementType, type ReactNode, Suspense } from 'react'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BlockSlug } from '@/types/blocks'

import { LegalAttributionsBlockRenderer } from './LegalAttributionsBlock/Renderer'
import { LegalPublisherInformationBlockRenderer } from './LegalPublisherInformationBlock/Renderer'
import {
  SERVER_RENDERED_BLOCK_SLUGS,
  type ServerRenderedBlockSlug,
} from './serverRenderedBlockSlugs'

export type RenderedBlocks = Record<string, ReactNode>

const RENDERERS: Record<ServerRenderedBlockSlug, ElementType> = {
  [BlockSlug.LegalPublisherInformation]: LegalPublisherInformationBlockRenderer,
  [BlockSlug.LegalAttributions]: LegalAttributionsBlockRenderer,
}

interface LexicalNode {
  type?: string
  fields?: {
    id?: string
    blockType?: string
  }
  children?: LexicalNode[]
}

const isServerRenderedSlug = (slug: string | undefined): slug is ServerRenderedBlockSlug =>
  (SERVER_RENDERED_BLOCK_SLUGS as readonly string[]).includes(slug ?? '')

/**
 * Renders a rich-text document's server-only blocks, keyed by block id, for
 * `RichText`'s `renderedBlocks` prop. Each block gets its own error boundary,
 * like the page sections in `RenderBlocks`.
 */
export const renderServerBlocks = (content: unknown): RenderedBlocks => {
  const rendered: RenderedBlocks = {}

  const visit = (node: LexicalNode | null | undefined) => {
    if (!node) return

    const { type, fields, children } = node

    if (type === 'block' && fields?.id && isServerRenderedSlug(fields.blockType)) {
      const Renderer = RENDERERS[fields.blockType]

      rendered[fields.id] = (
        <ErrorBoundary key={fields.id} name={fields.blockType}>
          <Suspense>
            <Renderer {...fields} />
          </Suspense>
        </ErrorBoundary>
      )
    }

    children?.forEach(visit)
  }

  visit(
    (
      content as {
        root?: LexicalNode
      } | null
    )?.root,
  )

  return rendered
}

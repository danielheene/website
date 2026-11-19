import type { RichTextField, Validate } from 'payload'

import { BlockSlug } from '@/types/blocks'
import type { Page } from '@/types/payload'

import { LEGAL_PAGE_SLUGS } from '../constants'

export const LEGAL_BLOCK_SLUGS: readonly string[] = [
  BlockSlug.LegalPublisherInformation,
  BlockSlug.LegalAttributions,
]

interface LexicalNode {
  type?: string
  fields?: {
    blockType?: string
  }
  children?: LexicalNode[]
}

/** Whether a Lexical tree contains one of the legal blocks, at any depth. */
export const containsLegalBlock = (node: LexicalNode | null | undefined): boolean => {
  if (!node) return false

  if (node.type === 'block' && LEGAL_BLOCK_SLUGS.includes(node.fields?.blockType ?? '')) {
    return true
  }

  return (node.children ?? []).some(containsLegalBlock)
}

/**
 * Lexical's BlocksFeature cannot offer blocks per document, so the editor lists
 * the legal blocks on every page; this rejects them outside the legal pages,
 * then runs the editor's own validation.
 */
export const validatePageContent: Validate<unknown, Page, unknown, RichTextField> = (
  value,
  options,
) => {
  const root = (
    value as {
      root?: LexicalNode
    } | null
  )?.root

  const slug = options.data?.slug

  if (containsLegalBlock(root) && !LEGAL_PAGE_SLUGS.includes(slug ?? '')) {
    return `Legal blocks can only be used on these pages: ${LEGAL_PAGE_SLUGS.join(', ')}.`
  }

  // What Payload's default richText validation does: defer to the editor.
  const { editor } = options as unknown as {
    editor: {
      validate: (value: unknown, options: unknown) => Promise<string | true> | string | true
    }
  }

  return editor.validate(value, options)
}

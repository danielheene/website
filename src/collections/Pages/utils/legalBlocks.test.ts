import { describe, expect, it, vi } from 'vitest'

import { getFilteredBlocks } from './getFilteredBlocks'
import { containsLegalBlock, validatePageContent } from './legalBlocks'

const legalBlock = {
  type: 'block',
  fields: {
    blockType: 'LegalAttributionsBlock',
  },
}

const docWith = (...children: unknown[]) => ({
  root: {
    children,
  },
})

const options = (slug: string) => {
  const editor = {
    validate: vi.fn(() => true),
  }

  return {
    editor,
    options: {
      data: {
        slug,
      },
      editor,
    } as unknown as Parameters<typeof validatePageContent>[1],
  }
}

describe('containsLegalBlock', () => {
  it('finds legal blocks at any depth', () => {
    expect(containsLegalBlock(docWith({ type: 'list', children: [legalBlock] }).root)).toBe(true)
    expect(containsLegalBlock(docWith({ type: 'paragraph', children: [] }).root)).toBe(false)
  })
})

describe('validatePageContent', () => {
  it('rejects legal blocks outside the legal pages', async () => {
    expect(await validatePageContent(docWith(legalBlock), options('about-me').options)).toMatch(
      /Legal blocks can only be used/,
    )
  })

  it('allows legal blocks on a legal page and defers to the editor validation', async () => {
    const { editor, options: opts } = options('legal-notice')

    expect(await validatePageContent(docWith(legalBlock), opts)).toBe(true)
    expect(editor.validate).toHaveBeenCalled()
  })
})

describe('getFilteredBlocks', () => {
  it('offers resume blocks only on the resume page and never legal blocks', () => {
    const resume = getFilteredBlocks({ slug: 'resume' })
    const other = getFilteredBlocks({ slug: 'home' })

    expect(resume).toContain('ResumeAboutMeBlock')
    expect(other).not.toContain('ResumeAboutMeBlock')
    expect([...resume, ...other].some((slug) => slug.startsWith('Legal'))).toBe(false)
  })
})

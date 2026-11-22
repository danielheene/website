import { describe, expect, it, vi } from 'vitest'

import { applyPageFixtures } from './fixtures'

const createPayload = (pages: Record<string, Record<string, unknown>>) => {
  const update = vi.fn().mockResolvedValue({})

  const find = vi.fn(async ({ where }: { where: { slug: { equals: string } } }) => {
    const page = pages[where.slug.equals]

    return { docs: page ? [{ id: where.slug.equals, ...page }] : [] }
  })

  // SAFETY: the fixtures only call find and update
  return { payload: { find, update } as never, update }
}

describe('applyPageFixtures', () => {
  it('fills missing résumé captions and keeps existing ones', async () => {
    const existing = { root: { children: [{ type: 'paragraph' }] } }

    const { payload, update } = createPayload({
      resume: {
        sections: [
          { blockType: 'ResumeAboutMeBlock', title: 'Mine', caption: existing },
          { blockType: 'ResumeContactBlock', title: 'Contact' },
          { blockType: 'ResumeDownloadsBlock', title: 'Downloads', caption: null },
        ],
      },
      'legal-notice': { content: { root: { children: [{ type: 'paragraph' }] } } },
    })

    const results = await applyPageFixtures({ payload })

    expect(results).toEqual([{ slug: 'resume', changed: ['sections'] }])

    const [{ data }] = update.mock.calls[0]

    expect(data.sections[0].caption).toBe(existing)
    expect(data.sections[1].caption.root.children).toHaveLength(1)
    expect(data.sections[2].caption.root.children).toHaveLength(1)
  })

  it('creates every résumé section and the legal blocks on empty pages', async () => {
    const { payload, update } = createPayload({
      resume: { sections: [] },
      'legal-notice': { content: null },
    })

    const results = await applyPageFixtures({ payload })

    expect(results.map(({ slug }) => slug)).toEqual(['resume', 'legal-notice'])
    expect(update.mock.calls[0][0].data.sections).toHaveLength(6)

    const blockTypes = update.mock.calls[1][0].data.content.root.children
      .filter((node: { type: string }) => node.type === 'block')
      .map((node: { fields: { blockType: string } }) => node.fields.blockType)

    expect(blockTypes).toEqual(['LegalPublisherInformationBlock', 'LegalAttributionsBlock'])
  })

  it('writes nothing when every field has content', async () => {
    const caption = { root: { children: [{ type: 'paragraph' }] } }

    const { payload, update } = createPayload({
      resume: { sections: [{ blockType: 'ResumeContactBlock', caption }] },
      'legal-notice': { content: caption },
    })

    expect(await applyPageFixtures({ payload })).toEqual([])
    expect(update).not.toHaveBeenCalled()
  })
})

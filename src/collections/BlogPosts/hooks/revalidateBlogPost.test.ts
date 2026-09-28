import { revalidatePath, revalidateTag } from 'next/cache'

import { describe, expect, it, vi } from 'vitest'

import type { BlogPostData } from '@/types/payload'

import { revalidateBlogPost } from './revalidateBlogPost'

type HookArgs = Parameters<typeof revalidateBlogPost>[0]

const run = (doc: Partial<BlogPostData>, previousDoc: Partial<BlogPostData>, context = {}) =>
  revalidateBlogPost({
    doc,
    previousDoc,
    context,
    req: {
      payload: {
        logger: {
          info: vi.fn(),
        },
      },
    },
  } as unknown as HookArgs)

describe('revalidateBlogPost', () => {
  it('revalidates the post path and the posts tag on publish', () => {
    const doc = {
      slug: 'hello',
      _status: 'published' as const,
    }
    expect(run(doc, doc)).toBe(doc)

    expect(revalidatePath).toHaveBeenCalledWith('/blog/post/hello')
    expect(revalidateTag).toHaveBeenCalledWith('posts', 'max')
  })

  it('revalidates the old path and the posts tag on unpublish', () => {
    run(
      {
        slug: 'hello',
        _status: 'draft',
      },
      {
        slug: 'hello',
        _status: 'published',
      },
    )

    expect(revalidatePath).toHaveBeenCalledWith('/blog/post/hello')
    expect(revalidateTag).toHaveBeenCalledWith('posts', 'max')
  })

  it('leaves caches alone for draft-only saves', () => {
    run(
      {
        slug: 'hello',
        _status: 'draft',
      },
      {
        slug: 'hello',
        _status: 'draft',
      },
    )

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('does not fail the write outside a Next context', () => {
    vi.mocked(revalidatePath).mockImplementationOnce(() => {
      throw new Error('Invariant: static generation store missing')
    })
    const doc = {
      slug: 'hello',
      _status: 'published' as const,
    }

    expect(run(doc, doc)).toBe(doc)
  })

  it('skips everything when asked to', () => {
    run(
      {
        slug: 'hello',
        _status: 'published',
      },
      {},
      {
        skipRevalidate: true,
      },
    )

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

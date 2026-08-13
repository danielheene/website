import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderTemplateCore = vi.fn()

vi.mock('@/lib/renderTemplate.core', () => ({
  renderTemplateCore: (args: unknown) => renderTemplateCore(args),
}))

import { renderLinkLabel } from './renderLinkLabel'

const findByID = vi.fn()
const loggerError = vi.fn()

const req = (locale?: string) =>
  ({
    context: {},
    locale,
    // Anonymous by default: the access-sensitive case this hook must not leak past.
    user: null,
    payload: {
      findByID,
      logger: {
        error: loggerError,
      },
    },
  }) as never

/** Runs the hook against a caller-owned request, so `req.context` is shared. */
const callWith = (request: unknown, siblingData: unknown) =>
  renderLinkLabel({
    siblingData,
    req: request,
  } as never)

const call = (siblingData: unknown, locale?: string) => callWith(req(locale), siblingData)

beforeEach(() => {
  renderTemplateCore.mockImplementation(async ({ template, data }) => ({
    result: template.replace('{title}', String(data?.title ?? '')),
    error: null,
  }))
  findByID.mockImplementation(async ({ id }: { id: string }) => ({
    id,
    title: `Title for ${id}`,
  }))
})

describe('renderLinkLabel', () => {
  it('renders {title} from a populated reference', async () => {
    await expect(
      call({
        label: '{title}',
        reference: {
          relationTo: 'pages',
          value: {
            id: 'page-1',
            title: 'About us',
            slug: 'about-us',
          },
        },
      }),
    ).resolves.toBe('About us')
  })

  it('renders {title} as the hostname of a custom URL', async () => {
    await expect(
      call({
        label: '{title}',
        url: 'https://github.com/danielheene/website',
      }),
    ).resolves.toBe('github.com')
  })

  it('passes a literal label through untouched', async () => {
    await expect(
      call({
        label: 'Read the docs',
        url: 'https://example.com',
      }),
    ).resolves.toBe('Read the docs')
  })

  it('returns an empty string when there is no label', async () => {
    await expect(
      call({
        url: 'https://example.com',
      }),
    ).resolves.toBe('')
    expect(renderTemplateCore).not.toHaveBeenCalled()
  })

  it('forwards req so the globals cache is shared', async () => {
    await call({
      label: '{title}',
      url: 'https://example.com',
    })

    expect(renderTemplateCore).toHaveBeenCalledWith(
      expect.objectContaining({
        req: expect.objectContaining({
          context: expect.any(Object),
        }),
      }),
    )
  })

  it('passes the request locale through to renderTemplateCore', async () => {
    await call(
      {
        label: '{title}',
        url: 'https://example.com',
      },
      'de',
    )

    expect(renderTemplateCore).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'de',
      }),
    )
  })

  it('falls back to the raw template when rendering fails', async () => {
    renderTemplateCore.mockResolvedValue({
      result: null,
      error: 'Missing a value for the placeholder: nope',
    })

    await expect(
      call({
        label: '{nope}',
        url: 'https://example.com',
      }),
    ).resolves.toBe('{nope}')
  })
})

describe('renderLinkLabel with an unpopulated reference', () => {
  const link = (id: string, relationTo = 'pages') => ({
    label: '{title}',
    reference: {
      relationTo,
      value: id,
    },
  })

  it('resolves {title} from a bare reference id', async () => {
    await expect(call(link('page-1'))).resolves.toBe('Title for page-1')

    expect(findByID).toHaveBeenCalledTimes(1)
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        id: 'page-1',
        depth: 0,
        select: {
          title: true,
        },
      }),
    )
  })

  it('fetches the same document only once per request', async () => {
    const request = req()

    await expect(
      Promise.all([
        callWith(request, link('page-1')),
        callWith(request, link('page-1')),
      ]),
    ).resolves.toEqual([
      'Title for page-1',
      'Title for page-1',
    ])

    expect(findByID).toHaveBeenCalledTimes(1)
  })

  it('fetches each distinct document once per request', async () => {
    const request = req()

    await expect(
      Promise.all([
        callWith(request, link('page-1')),
        callWith(request, link('page-2')),
        callWith(request, link('page-1', 'posts')),
      ]),
    ).resolves.toEqual([
      'Title for page-1',
      'Title for page-2',
      'Title for page-1',
    ])

    expect(findByID).toHaveBeenCalledTimes(3)
  })

  it('degrades to an empty title when the lookup fails', async () => {
    findByID.mockRejectedValue(new Error('not found'))

    await expect(
      call({
        label: 'See {title}',
        reference: {
          relationTo: 'pages',
          value: 'missing',
        },
      }),
    ).resolves.toBe('See ')

    expect(loggerError).toHaveBeenCalled()
  })

  it('retries a failed lookup instead of caching the rejection', async () => {
    const request = req()

    findByID.mockRejectedValueOnce(new Error('transient'))

    await expect(callWith(request, link('page-1'))).resolves.toBe('')
    await expect(callWith(request, link('page-1'))).resolves.toBe('Title for page-1')

    expect(findByID).toHaveBeenCalledTimes(2)
  })

  it('degrades to an empty title when the read is denied', async () => {
    // An anonymous reader hitting an unpublished target: `findByID` with
    // `disableErrors` resolves to null rather than throwing.
    findByID.mockResolvedValue(null)

    await expect(
      call({
        label: 'See {title}',
        reference: {
          relationTo: 'pages',
          value: 'unpublished',
        },
      }),
    ).resolves.toBe('See ')
  })

  it('respects collection access control and silences denied reads', async () => {
    await call(link('page-1'))

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        disableErrors: true,
        user: null,
      }),
    )
  })

  it('threads the draft flag from the request', async () => {
    const request = req()

    ;(
      request as unknown as {
        draft?: boolean
      }
    ).draft = true

    await callWith(request, link('page-1'))

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: true,
      }),
    )
  })

  it('degrades to an empty title when the document has no title', async () => {
    findByID.mockResolvedValue({
      id: 'page-1',
    })

    await expect(call(link('page-1'))).resolves.toBe('')
  })

  it('does not fetch when the reference is already populated', async () => {
    await expect(
      call({
        label: '{title}',
        reference: {
          relationTo: 'pages',
          value: {
            id: 'page-1',
            title: 'About us',
          },
        },
      }),
    ).resolves.toBe('About us')

    expect(findByID).not.toHaveBeenCalled()
  })

  it('does not fetch for a custom URL', async () => {
    await expect(
      call({
        label: '{title}',
        url: 'https://example.com',
      }),
    ).resolves.toBe('example.com')

    expect(findByID).not.toHaveBeenCalled()
  })
})

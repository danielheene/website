import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderTemplateCore = vi.fn()

vi.mock('@/lib/renderTemplate.core', () => ({
  renderTemplateCore: (args: unknown) => renderTemplateCore(args),
}))

import { renderLinkLabel } from './renderLinkLabel'

const req = (locale?: string) =>
  ({
    context: {},
    locale,
    payload: {
      logger: {
        error: vi.fn(),
      },
    },
  }) as never

const call = (siblingData: unknown, locale?: string) =>
  renderLinkLabel({
    siblingData,
    req: req(locale),
  } as never)

beforeEach(() => {
  renderTemplateCore.mockImplementation(async ({ template, data }) => ({
    result: template.replace('{title}', String(data?.title ?? '')),
    error: null,
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

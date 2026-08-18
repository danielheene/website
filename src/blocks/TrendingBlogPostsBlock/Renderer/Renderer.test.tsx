// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TrendingBlogPost } from '@/lib/fetchers/fetchTrendingBlogPosts'

const fetchTrendingBlogPostsMock =
  vi.fn<(args: { days: number; limit: number }) => Promise<TrendingBlogPost[] | null>>()

vi.mock('@/lib/fetchers/fetchTrendingBlogPosts', () => ({
  fetchTrendingBlogPosts: (args: { days: number; limit: number }) =>
    fetchTrendingBlogPostsMock(args),
}))

const { TrendingBlogPostsBlockRenderer } = await import('./Renderer')

const buildPost = (slug: string, title: string): TrendingBlogPost => ({
  slug,
  views: 10,
  post: {
    id: slug,
    title,
    slug,
  } as TrendingBlogPost['post'],
})

describe('TrendingBlogPostsBlockRenderer', () => {
  it('renders a teaser card for each post with a link to its blog post page', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([
      buildPost('first-post', 'First Post'),
      buildPost('second-post', 'Second Post'),
    ])

    const element = await TrendingBlogPostsBlockRenderer({})
    render(element)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/blog/post/first-post')
    expect(links[1]).toHaveAttribute('href', '/blog/post/second-post')
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('renders nothing when the fetcher returns null', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue(null)

    const element = await TrendingBlogPostsBlockRenderer({})

    expect(element).toBeNull()
  })

  it('renders nothing when the fetcher returns an empty array', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([])

    const element = await TrendingBlogPostsBlockRenderer({})

    expect(element).toBeNull()
  })

  it('renders the heading when provided', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([
      buildPost('first-post', 'First Post'),
    ])

    const element = await TrendingBlogPostsBlockRenderer({
      heading: {
        en: 'Trending Now',
        de: 'Beliebte Beiträge',
      },
    })
    render(element)

    expect(screen.getByText('Trending Now')).toBeInTheDocument()
  })

  it('does not render an image when heroImage.value.url is null', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([
      {
        slug: 'no-hero-url',
        views: 10,
        post: {
          id: 'no-hero-url',
          title: 'No Hero URL',
          slug: 'no-hero-url',
          heroImage: {
            relationTo: 'images',
            value: {
              id: 'media-1',
              alt: 'Alt text',
              url: null,
            },
          },
        } as unknown as TrendingBlogPost['post'],
      },
    ])

    const element = await TrendingBlogPostsBlockRenderer({})
    render(element)

    expect(screen.getByText('No Hero URL')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('does not render an image when heroImage.value.url is an empty string', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([
      {
        slug: 'empty-hero-url',
        views: 10,
        post: {
          id: 'empty-hero-url',
          title: 'Empty Hero URL',
          slug: 'empty-hero-url',
          heroImage: {
            relationTo: 'images',
            value: {
              id: 'media-2',
              alt: 'Alt text',
              url: '',
            },
          },
        } as unknown as TrendingBlogPost['post'],
      },
    ])

    const element = await TrendingBlogPostsBlockRenderer({})
    render(element)

    expect(screen.getByText('Empty Hero URL')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('omits the heading when both en and de are empty', async () => {
    fetchTrendingBlogPostsMock.mockResolvedValue([
      buildPost('first-post', 'First Post'),
    ])

    const element = await TrendingBlogPostsBlockRenderer({
      heading: {
        en: '',
        de: '',
      },
    })
    render(element)

    expect(
      screen.queryByRole('heading', {
        level: 2,
      }),
    ).not.toBeInTheDocument()
  })
})

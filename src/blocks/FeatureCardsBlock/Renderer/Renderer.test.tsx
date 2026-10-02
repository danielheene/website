import type { HTMLAttributes } from 'react'

// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FeatureCardsBlock } from '@/types/payload'

import { FeatureCardsBlockRenderer } from '.'

// The reveal animation needs IntersectionObserver and matchMedia, which jsdom
// lacks; it is covered by its own tests.
vi.mock('@/components/Reveal', () => ({
  Reveal: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
}))

type Card = NonNullable<FeatureCardsBlock['cards']>[number]

const card = (overrides: Partial<Card>): Card => ({
  size: 'third',
  color: 'primary',
  title: 'Title',
  link: {
    linkType: 'custom',
    url: '',
    text: '',
  },
  ...overrides,
})

const renderBlock = (cards: Card[], heading?: string) =>
  render(
    FeatureCardsBlockRenderer({
      blockType: 'FeatureCardsBlock',
      heading,
      cards,
    }) ?? <></>,
  )

describe('FeatureCardsBlockRenderer', () => {
  it('renders nothing without cards', () => {
    expect(
      FeatureCardsBlockRenderer({
        blockType: 'FeatureCardsBlock',
        cards: [],
      }),
    ).toBeNull()
  })

  it('renders the heading and one card per entry with its grid span', () => {
    renderBlock(
      [
        card({
          size: 'twoThirds',
          title: 'Resume',
        }),
        card({
          size: 'full',
          title: 'Validator',
          text: 'Check a copy.',
        }),
      ],
      'Resume features',
    )

    expect(screen.getByRole('heading', { name: 'Resume features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resume' }).closest('article')).toHaveClass(
      'lg:col-span-4',
    )
    expect(screen.getByRole('heading', { name: 'Validator' }).closest('article')).toHaveClass(
      'lg:col-span-6',
    )
    expect(screen.getByText('Check a copy.')).toBeInTheDocument()
  })

  it('links the card when a target is set, and only then', () => {
    renderBlock([
      card({
        title: 'Download',
        link: {
          linkType: 'custom',
          url: '/resume/latest',
          text: 'Get the PDF',
        },
      }),
      card({
        title: 'No link',
      }),
    ])

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/resume/latest')
    expect(links[0]).toHaveTextContent('Get the PDF')
  })
})

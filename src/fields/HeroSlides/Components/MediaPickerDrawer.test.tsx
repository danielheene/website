// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MediaPickerDrawer } from './MediaPickerDrawer'

const closeModalMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  Drawer: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
  useModal: () => ({
    closeModal: closeModalMock,
  }),
}))

describe('MediaPickerDrawer', () => {
  it('renders every item with its label and thumbnail', () => {
    render(
      <MediaPickerDrawer
        items={[
          {
            id: 'a',
            label: 'First',
            onSelect: vi.fn(),
            thumbnail: <span data-testid="thumb-a" />,
          },
          {
            id: 'b',
            label: 'Second',
            onSelect: vi.fn(),
            thumbnail: <span data-testid="thumb-b" />,
          },
        ]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    expect(screen.getByText('Pick something')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'First',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Second',
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('thumb-a')).toBeInTheDocument()
    expect(screen.getByTestId('thumb-b')).toBeInTheDocument()
  })

  it('calls onSelect and closes the drawer when a card is clicked', () => {
    const onSelect = vi.fn()
    closeModalMock.mockClear()

    render(
      <MediaPickerDrawer
        items={[
          {
            id: 'a',
            label: 'First',
            onSelect,
            thumbnail: <span />,
          },
        ]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'First',
      }),
    )

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(closeModalMock).toHaveBeenCalledWith('test-drawer')
  })

  it('marks the selected item with aria-pressed', () => {
    render(
      <MediaPickerDrawer
        items={[
          {
            id: 'a',
            label: 'First',
            onSelect: vi.fn(),
            selected: true,
            thumbnail: <span />,
          },
          {
            id: 'b',
            label: 'Second',
            onSelect: vi.fn(),
            selected: false,
            thumbnail: <span />,
          },
        ]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'First',
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', {
        name: 'Second',
      }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('disables an item and does not fire onSelect when clicked', () => {
    const onSelect = vi.fn()

    render(
      <MediaPickerDrawer
        items={[
          {
            disabled: true,
            id: 'a',
            label: 'First',
            onSelect,
            thumbnail: <span />,
          },
        ]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    const button = screen.getByRole('button', {
      name: 'First',
    })
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows the empty message when there are no items and not loading', () => {
    render(
      <MediaPickerDrawer
        emptyMessage="No photos yet."
        items={[]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })

  it('hides the empty message while loading', () => {
    render(
      <MediaPickerDrawer
        emptyMessage="No photos yet."
        isLoading
        items={[]}
        slug="test-drawer"
        title="Pick something"
      />,
    )

    expect(screen.queryByText('No photos yet.')).not.toBeInTheDocument()
  })

  it('renders the toolbar and footer slots', () => {
    render(
      <MediaPickerDrawer
        footer={<div data-testid="footer">Load more</div>}
        items={[]}
        slug="test-drawer"
        title="Pick something"
        toolbar={<div data-testid="toolbar">Search…</div>}
      />,
    )

    expect(screen.getByTestId('toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})

// @vitest-environment jsdom
import * as React from 'react'
import type { ArrayFieldClientProps } from 'payload'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HeroSlidesSidebarEditor } from './HeroSlidesSidebarEditor'

type Row = {
  id: string
}
type FieldStateStub = Record<
  string,
  {
    value?: unknown
  }
>

const fieldProps = {
  field: {
    name: 'slides',
  },
  path: 'hero.slides',
  schemaPath: 'hero.slides',
} as unknown as ArrayFieldClientProps

// Mutable state mutated in place per test — the established pattern for
// this field's tests (see `SlideThumb.test.tsx`/`FilmstripEditor.test.tsx`),
// since `vi.mock`'s hoisted factory closes over the reference once.
let rows: Row[] = []
const formFields: FieldStateStub = {}

const setFormFields = (next: FieldStateStub) => {
  for (const key of Object.keys(formFields)) delete formFields[key]
  Object.assign(formFields, next)
}

const addFieldRowMock = vi.fn()
const replaceFieldRowMock = vi.fn()
const removeFieldRowMock = vi.fn()
const moveFieldRowMock = vi.fn()
const setBackgroundProcessingMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  useField: () => ({
    path: 'hero.slides',
    rows,
  }),
  useForm: () => ({
    addFieldRow: addFieldRowMock,
    moveFieldRow: moveFieldRowMock,
    removeFieldRow: removeFieldRowMock,
    replaceFieldRow: replaceFieldRowMock,
    setBackgroundProcessing: setBackgroundProcessingMock,
  }),
  useFormFields: (
    selector: (
      args: [
        FieldStateStub,
      ],
    ) => unknown,
  ) =>
    selector([
      formFields,
    ]),
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('@/lib/uploadHeroSlideMedia', () => ({
  uploadHeroSlideMedia: vi.fn(),
}))

vi.mock('@/lib/unsplash/importPhoto', () => ({
  importPhoto: vi.fn(),
}))

vi.mock('@/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('next/dynamic', () => ({
  default: (
    loader: () => Promise<{
      default: React.ComponentType<Record<string, unknown>>
    }>,
  ) => {
    return function DynamicMock(props: Record<string, unknown>) {
      const [Component, setComponent] = React.useState<React.ComponentType<
        Record<string, unknown>
      > | null>(null)
      React.useEffect(() => {
        let cancelled = false
        void loader().then((mod) => {
          if (!cancelled) setComponent(() => mod.default)
        })
        return () => {
          cancelled = true
        }
      }, [])
      return Component ? <Component {...props} /> : null
    }
  },
}))

vi.mock('./ShaderPreviewCanvas', () => ({
  default: ({
    entry,
  }: {
    entry: {
      key: string
    }
  }) => <div data-testid="shader-preview">{entry.key}</div>,
}))

vi.mock('./AddSlideMenu', () => ({
  AddSlideMenu: ({
    menuId,
    onSelectImage,
    renderTrigger,
  }: {
    menuId: string
    onSelectImage: (doc: { id: string }) => void
    renderTrigger?: React.ReactNode
  }) => (
    <div data-testid={`add-slide-menu-${menuId}`}>
      {renderTrigger}
      <button
        onClick={() =>
          onSelectImage({
            id: 'img-1',
          })
        }
        type="button"
      >
        {`Select Image (${menuId})`}
      </button>
    </div>
  ),
}))

describe('HeroSlidesSidebarEditor', () => {
  beforeEach(() => {
    rows = []
    setFormFields({})
    addFieldRowMock.mockClear()
    replaceFieldRowMock.mockClear()
    removeFieldRowMock.mockClear()
    moveFieldRowMock.mockClear()
    setBackgroundProcessingMock.mockClear()
  })

  it('shows an empty state and the add menu when there are no slides yet', () => {
    render(<HeroSlidesSidebarEditor {...fieldProps} />)

    expect(screen.getByText('No hero slides yet')).toBeInTheDocument()
    expect(screen.getByTestId('add-slide-menu-hero.slides-add')).toBeInTheDocument()
  })

  it('hides prev/next and dots for a singleton, but still shows Remove/Replace', () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: {
            url: 'https://example.com/a.webp',
          },
        },
      },
    })

    render(<HeroSlidesSidebarEditor {...fieldProps} />)

    expect(screen.queryByLabelText('Previous slide')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next slide')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Remove slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Replace slide')).toBeInTheDocument()
  })

  it('shows prev/next + dots for 2+ slides and steps between them', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: {
            url: 'https://example.com/a.webp',
          },
        },
      },
      'hero.slides.1.slideType': {
        value: 'image',
      },
      'hero.slides.1.media': {
        value: {
          relationTo: 'images',
          value: {
            url: 'https://example.com/b.webp',
          },
        },
      },
    })

    const { container } = render(<HeroSlidesSidebarEditor {...fieldProps} />)

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.webp')

    fireEvent.click(screen.getByLabelText('Next slide'))

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/b.webp')
    expect(screen.getByLabelText('Go to slide 2')).toHaveAttribute('aria-current', 'true')
  })

  it('appends a new row via addFieldRow when the add menu selects an image', () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })

    render(<HeroSlidesSidebarEditor {...fieldProps} />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Image (hero.slides-add)',
      }),
    )

    expect(addFieldRowMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'hero.slides',
        schemaPath: 'hero.slides',
        rowIndex: 1,
        subFieldState: expect.objectContaining({
          media: expect.objectContaining({
            value: {
              relationTo: 'images',
              value: 'img-1',
            },
          }),
        }),
      }),
    )
  })

  it('replaces the active slide via replaceFieldRow when the replace menu selects an image', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.1.slideType': {
        value: 'image',
      },
    })

    render(<HeroSlidesSidebarEditor {...fieldProps} />)

    fireEvent.click(screen.getByLabelText('Next slide'))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Image (hero.slides-replace)',
      }),
    )

    expect(replaceFieldRowMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'hero.slides',
        schemaPath: 'hero.slides',
        rowIndex: 1,
        subFieldState: expect.objectContaining({
          media: expect.objectContaining({
            value: {
              relationTo: 'images',
              value: 'img-1',
            },
          }),
        }),
      }),
    )
  })

  it('removes the active slide via removeFieldRow when Remove is clicked', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.1.slideType': {
        value: 'image',
      },
    })

    render(<HeroSlidesSidebarEditor {...fieldProps} />)

    fireEvent.click(screen.getByLabelText('Next slide'))
    fireEvent.click(screen.getByLabelText('Remove slide'))

    expect(removeFieldRowMock).toHaveBeenCalledWith({
      path: 'hero.slides',
      rowIndex: 1,
    })
  })
})

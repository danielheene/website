// @vitest-environment jsdom
import type { ArrayFieldClientProps } from 'payload'

import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FilmstripEditor } from './FilmstripEditor'

type Row = {
  id: string
}

// A minimal stand-in for the real `ArrayFieldClientProps` this component
// reads `path`/`schemaPath`/`field.name`/`field.maxRows` from (via
// `useField`'s `potentiallyStalePath`, the mutator wrappers, and the
// `maxRows` cap check) — the rest of the real shape is irrelevant to this
// component's own logic.
const fieldProps = {
  field: {
    name: 'slides',
  },
  path: 'hero.slides',
  schemaPath: 'hero.slides',
} as unknown as ArrayFieldClientProps

// Mutable state the mocked `useField`/`useForm` hooks read from, mutated in
// place per test rather than reassigned — the same pattern used throughout
// this field's other tests (see `SlideThumb.test.tsx`), since a plain `let`
// reassignment wouldn't propagate through `vi.mock`'s hoisted factory.
let rows: Row[] = []

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
        Record<
          string,
          {
            value?: unknown
          }
        >,
      ],
    ) => unknown,
  ) =>
    selector([
      {},
    ]),
  toast: {
    error: vi.fn(),
  },
}))

// Embla needs a real DOM layout engine (ResizeObserver, matchMedia) that
// jsdom doesn't provide; this component's own tests only exercise row
// mutation logic, not carousel scroll behavior, so a no-op stand-in for the
// hook (returning a plain ref callback) is enough.
vi.mock('embla-carousel-react', () => ({
  default: () => [
    () => {
      /* no-op ref */
    },
  ],
}))

vi.mock('@/lib/uploadHeroSlideMedia', () => ({
  uploadHeroSlideMedia: vi.fn(),
}))

vi.mock('@/lib/unsplash/importPhoto', () => ({
  importPhoto: vi.fn(),
}))

vi.mock('./SlideThumb', () => ({
  SlideThumb: ({
    canMoveLeft,
    canMoveRight,
    canReorder,
    isPending,
    menuId,
    onMoveLeft,
    onMoveRight,
    onRemove,
    onReplaceWithImage,
    rowPath,
  }: {
    canMoveLeft: boolean
    canMoveRight: boolean
    canReorder: boolean
    isPending: boolean
    menuId: string
    onMoveLeft: () => void
    onMoveRight: () => void
    onRemove: () => void
    onReplaceWithImage: (doc: { id: string }) => void
    rowPath: string
  }) => (
    <div data-testid={`slide-thumb-${rowPath}`}>
      <span>{`canReorder:${canReorder}`}</span>
      <span>{`isPending:${isPending}`}</span>
      <span>{`menuId:${menuId}`}</span>
      <button disabled={!canMoveLeft} onClick={onMoveLeft} type="button">
        Move left
      </button>
      <button disabled={!canMoveRight} onClick={onMoveRight} type="button">
        Move right
      </button>
      <button onClick={onRemove} type="button">
        Remove
      </button>
      <button
        onClick={() =>
          onReplaceWithImage({
            id: 'img-1',
          })
        }
        type="button"
      >
        Replace
      </button>
    </div>
  ),
}))

vi.mock('./AddSlideMenu', () => ({
  AddSlideMenu: ({
    menuId,
    onSelectImage,
    open,
    renderTrigger,
  }: {
    menuId: string
    onSelectImage: (doc: { id: string }) => void
    open?: boolean
    renderTrigger?: React.ReactNode
  }) => (
    <div data-testid={`add-slide-menu-${menuId}`}>
      {renderTrigger}
      <span>{`open:${open}`}</span>
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

describe('FilmstripEditor', () => {
  beforeEach(() => {
    rows = []
    addFieldRowMock.mockClear()
    replaceFieldRowMock.mockClear()
    removeFieldRowMock.mockClear()
    moveFieldRowMock.mockClear()
    setBackgroundProcessingMock.mockClear()
  })

  it('renders one SlideThumb per row, plus a trailing add menu', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]

    render(<FilmstripEditor {...fieldProps} />)

    expect(screen.getByTestId('slide-thumb-hero.slides.0')).toBeInTheDocument()
    expect(screen.getByTestId('slide-thumb-hero.slides.1')).toBeInTheDocument()
    expect(screen.getByTestId('add-slide-menu-hero.slides-add')).toBeInTheDocument()
  })

  it('keeps the trailing add menu when unbounded (no maxRows)', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]

    render(<FilmstripEditor {...fieldProps} />)

    expect(screen.getByTestId('add-slide-menu-hero.slides-add')).toBeInTheDocument()
  })

  it('hides the trailing add menu once maxRows is reached', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    const cappedFieldProps = {
      ...fieldProps,
      field: {
        ...fieldProps.field,
        maxRows: 2,
      },
    } as ArrayFieldClientProps

    render(<FilmstripEditor {...cappedFieldProps} />)

    expect(screen.getByTestId('slide-thumb-hero.slides.0')).toBeInTheDocument()
    expect(screen.getByTestId('slide-thumb-hero.slides.1')).toBeInTheDocument()
    expect(screen.queryByTestId('add-slide-menu-hero.slides-add')).not.toBeInTheDocument()
  })

  it('still shows the trailing add menu below maxRows', () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    const cappedFieldProps = {
      ...fieldProps,
      field: {
        ...fieldProps.field,
        maxRows: 2,
      },
    } as ArrayFieldClientProps

    render(<FilmstripEditor {...cappedFieldProps} />)

    expect(screen.getByTestId('add-slide-menu-hero.slides-add')).toBeInTheDocument()
  })

  it('marks canReorder true with 2+ slides, false for a singleton', () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    const { rerender } = render(<FilmstripEditor {...fieldProps} />)
    expect(screen.getByTestId('slide-thumb-hero.slides.0')).toHaveTextContent('canReorder:false')

    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    rerender(<FilmstripEditor {...fieldProps} />)
    expect(screen.getByTestId('slide-thumb-hero.slides.0')).toHaveTextContent('canReorder:true')
  })

  it('calls moveFieldRow with the correct from/to indices when a reorder caret is clicked', () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
      {
        id: 'row-2',
      },
    ]
    render(<FilmstripEditor {...fieldProps} />)

    const middleThumb = screen.getByTestId('slide-thumb-hero.slides.1')
    fireEvent.click(
      within(middleThumb).getByRole('button', {
        name: 'Move right',
      }),
    )

    expect(moveFieldRowMock).toHaveBeenCalledWith({
      moveFromIndex: 1,
      moveToIndex: 2,
      path: 'hero.slides',
    })
  })

  it("calls removeFieldRow with this row's index when Remove is clicked", () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    render(<FilmstripEditor {...fieldProps} />)

    const secondThumb = screen.getByTestId('slide-thumb-hero.slides.1')
    fireEvent.click(
      within(secondThumb).getByRole('button', {
        name: 'Remove',
      }),
    )

    expect(removeFieldRowMock).toHaveBeenCalledWith({
      path: 'hero.slides',
      rowIndex: 1,
    })
  })

  it('appends a new row via addFieldRow when the trailing add menu selects an image', () => {
    rows = [
      {
        id: 'row-0',
      },
    ]
    render(<FilmstripEditor {...fieldProps} />)

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
          slideType: expect.objectContaining({
            value: 'image',
          }),
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

  it("gives each row its own replace menuId, and replaces that row's field when it selects an image", () => {
    rows = [
      {
        id: 'row-0',
      },
      {
        id: 'row-1',
      },
    ]
    render(<FilmstripEditor {...fieldProps} />)

    // Each row's "Replace" is its own `AddSlideMenu` instance, not a single
    // shared one retargeted by index — a shared instance's hidden trigger
    // positioned the popup at the bottom of the section instead of at the
    // clicked row (the bug this per-row wiring fixes).
    expect(screen.getByTestId('slide-thumb-hero.slides.0')).toHaveTextContent(
      'menuId:hero.slides.0-replace',
    )
    expect(screen.getByTestId('slide-thumb-hero.slides.1')).toHaveTextContent(
      'menuId:hero.slides.1-replace',
    )

    const secondThumb = screen.getByTestId('slide-thumb-hero.slides.1')
    fireEvent.click(
      within(secondThumb).getByRole('button', {
        name: 'Replace',
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
})

// @vitest-environment jsdom
import * as React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SlideThumb } from './SlideThumb'

type FieldStateStub = Record<
  string,
  {
    value?: unknown
  }
>

// A mutable object whose *keys* are reassigned per test, never the binding
// itself — `vi.mock`'s hoisted factory closes over this reference once, so a
// `let formFields = {...}` reassigned per test would leave the mock reading
// the original (now stale) object.
const formFields: FieldStateStub = {}

const setFormFields = (next: FieldStateStub) => {
  for (const key of Object.keys(formFields)) delete formFields[key]
  Object.assign(formFields, next)
}

vi.mock('@payloadcms/ui', () => ({
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
}))

vi.mock('@/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
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

// `next/dynamic(() => import(...), { ssr: false })` never resolves
// synchronously under Vitest/jsdom — the real dynamic loader stays pending
// through the whole test, so the mocked module above never actually
// renders. Mocking `next/dynamic` to a small stateful wrapper that resolves
// the loader in an effect and re-renders once it does sidesteps that, while
// still exercising the mocked `ShaderPreviewCanvas` module — `waitFor` in
// the shader test below waits out that one extra render.
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

// `SlideThumb` renders its own `AddSlideMenu` instance for "Replace" now
// (rather than delegating to a caller-owned callback) — this test only
// exercises `SlideThumb`'s own layout/toolbar logic, not `AddSlideMenu`'s
// picker internals, so it's stubbed the same way `SingleSlideEditor`'s
// tests stub it: `renderTrigger` passes through unchanged, so the real
// `aria-label="Replace slide"` button `SlideThumb` supplies is still queryable.
vi.mock('./AddSlideMenu', () => ({
  AddSlideMenu: ({
    menuId,
    renderTrigger,
  }: {
    menuId: string
    renderTrigger?: React.ReactNode
  }) => <div data-testid={`add-slide-menu-${menuId}`}>{renderTrigger}</div>,
}))

const defaultProps = {
  canMoveLeft: true,
  canMoveRight: true,
  canReorder: true,
  importingId: null,
  isPending: false,
  menuId: 'hero.slides.0-replace',
  onImportUnsplash: vi.fn(),
  onMoveLeft: vi.fn(),
  onMoveRight: vi.fn(),
  onRemove: vi.fn(),
  onReplaceWithImage: vi.fn(),
  onReplaceWithShader: vi.fn(),
  onReplaceWithVideo: vi.fn(),
  onUploadImage: vi.fn(),
  onUploadVideo: vi.fn(),
  rowPath: 'hero.slides.0',
  thumbnailCache: {},
}

describe('SlideThumb', () => {
  it("renders an image thumbnail from the row's populated media relation", () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'images',
          value: {
            url: 'https://example.com/hero.webp',
          },
        },
      },
    })

    const { container } = render(<SlideThumb {...defaultProps} />)

    // The thumbnail is decorative (`alt=""`), so it has no accessible "img"
    // role — query the element directly, same as `RowLabel`'s own convention.
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/hero.webp')
  })

  it("renders a video's poster from its populated thumbnails relation", () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'video',
      },
      'hero.slides.0.media': {
        value: {
          relationTo: 'videos',
          value: {
            thumbnails: [
              {
                value: {
                  url: 'https://example.com/poster.webp',
                },
              },
            ],
          },
        },
      },
    })

    const { container } = render(<SlideThumb {...defaultProps} />)

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/poster.webp')
  })

  it('renders the live shader preview for a shader slide', async () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'shader',
      },
      'hero.slides.0.shader': {
        value: 'darkveil',
      },
    })

    render(<SlideThumb {...defaultProps} />)

    // The mocked `next/dynamic` resolves its loader in an effect, one tick
    // after the initial render.
    await waitFor(() => expect(screen.getByTestId('shader-preview')).toHaveTextContent('darkveil'))
  })

  it('shows an empty state when the row has no media set yet', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })

    render(<SlideThumb {...defaultProps} />)

    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows a pending spinner instead of the thumbnail while isPending', () => {
    setFormFields({})

    render(<SlideThumb {...defaultProps} isPending />)

    expect(screen.getByTestId('icon-material-symbols:progress-activity')).toBeInTheDocument()
    expect(screen.queryByText('Empty')).not.toBeInTheDocument()
  })

  it('hides the whole hover toolbar while isPending', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })

    render(<SlideThumb {...defaultProps} isPending />)

    expect(screen.queryByLabelText('Remove slide')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Replace slide')).not.toBeInTheDocument()
  })

  it('always shows Remove, calling its handler on click, and Replace as its own AddSlideMenu instance', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })
    const onRemove = vi.fn()

    render(<SlideThumb {...defaultProps} onRemove={onRemove} />)

    fireEvent.click(screen.getByLabelText('Remove slide'))
    expect(onRemove).toHaveBeenCalledTimes(1)

    // "Replace" is this row's own `AddSlideMenu`, keyed by its own `menuId` —
    // not a shared instance retargeted by index (see `FilmstripEditor`'s
    // fix: a shared instance's hidden trigger positioned the popup wrong).
    expect(screen.getByTestId(`add-slide-menu-${defaultProps.menuId}`)).toBeInTheDocument()
    expect(screen.getByLabelText('Replace slide')).toBeInTheDocument()
  })

  it('hides the reorder carets entirely when canReorder is false (singleton)', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })

    render(<SlideThumb {...defaultProps} canReorder={false} />)

    expect(screen.queryByLabelText('Move slide earlier')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Move slide later')).not.toBeInTheDocument()
    // Remove/Replace still present per the confirmed singleton rule.
    expect(screen.getByLabelText('Remove slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Replace slide')).toBeInTheDocument()
  })

  it('disables the reorder carets at the array edges without hiding them', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })

    render(<SlideThumb {...defaultProps} canMoveLeft={false} canMoveRight={true} />)

    expect(screen.getByLabelText('Move slide earlier')).toBeDisabled()
    expect(screen.getByLabelText('Move slide later')).not.toBeDisabled()
  })

  it('calls onMoveLeft/onMoveRight when the reorder carets are clicked', () => {
    setFormFields({
      'hero.slides.0.slideType': {
        value: 'image',
      },
    })
    const onMoveLeft = vi.fn()
    const onMoveRight = vi.fn()

    render(<SlideThumb {...defaultProps} onMoveLeft={onMoveLeft} onMoveRight={onMoveRight} />)

    fireEvent.click(screen.getByLabelText('Move slide earlier'))
    fireEvent.click(screen.getByLabelText('Move slide later'))

    expect(onMoveLeft).toHaveBeenCalledTimes(1)
    expect(onMoveRight).toHaveBeenCalledTimes(1)
  })
})

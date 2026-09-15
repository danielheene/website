// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AddSlideMenu } from './AddSlideMenu'

const openModalMock = vi.fn()

vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button disabled={disabled} type="button">
      {children}
    </button>
  ),
  Popup: ({
    button,
    forceOpen,
    render,
    onToggleClose,
    onToggleOpen,
  }: {
    button: React.ReactNode
    forceOpen?: boolean
    render: (args: { close: () => void }) => React.ReactNode
    onToggleClose?: () => void
    onToggleOpen?: (active: boolean) => void
  }) => {
    // A minimal stand-in for `Popup`'s real forceOpen/onToggle* contract:
    // when `forceOpen` is explicitly set, the popup content's visibility —
    // and the toggle callbacks — follow it instead of any internal state.
    if (forceOpen === false) return <div>{button}</div>
    if (forceOpen === true) onToggleOpen?.(true)
    return (
      <div>
        {button}
        {render({
          close: () => onToggleClose?.(),
        })}
      </div>
    )
  },
  PopupList: {
    ButtonGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick} type="button">
        {children}
      </button>
    ),
    Divider: () => <hr />,
    GroupLabel: ({ label }: { label: string }) => <div>{label}</div>,
  },
  useDrawerSlug: (slug: string) => slug,
  useModal: () => ({
    openModal: openModalMock,
  }),
}))

vi.mock('./SelectMediaDrawer', () => ({
  SelectMediaDrawer: ({ kind, slug }: { kind: string; slug: string }) => (
    <div data-testid={`select-media-drawer-${kind}`}>{slug}</div>
  ),
}))

vi.mock('./SelectUnsplashDrawer', () => ({
  SelectUnsplashDrawer: ({ slug }: { slug: string }) => (
    <div data-testid="select-unsplash-drawer">{slug}</div>
  ),
}))

vi.mock('./ShaderPickerDrawer', () => ({
  ShaderPickerDrawer: ({ slug }: { slug: string }) => (
    <div data-testid="shader-picker-drawer">{slug}</div>
  ),
}))

const noop = () => {
  /* not exercised in a given test */
}

describe('AddSlideMenu', () => {
  it('renders all six actions, grouped, with dividers between groups', () => {
    render(
      <AddSlideMenu
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
      />,
    )

    expect(screen.getByText('+ Add Hero BG')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    ;[
      'Select Image',
      'Upload Image',
      'Select Video',
      'Upload Video',
      'Import Unsplash',
      'Select Shader',
    ].forEach((label) => {
      expect(
        screen.getByRole('button', {
          name: label,
        }),
      ).toBeInTheDocument()
    })
  })

  it('opens the image select drawer via openModal, scoped by menuId', () => {
    render(
      <AddSlideMenu
        menuId="filmstrip-0"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Image',
      }),
    )

    expect(openModalMock).toHaveBeenCalledWith('hero-select-image-filmstrip-0')
  })

  it('opens the video select drawer, the Unsplash drawer, and the shader drawer via their own scoped slugs', () => {
    render(
      <AddSlideMenu
        menuId="filmstrip-0"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Video',
      }),
    )
    expect(openModalMock).toHaveBeenCalledWith('hero-select-video-filmstrip-0')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Import Unsplash',
      }),
    )
    expect(openModalMock).toHaveBeenCalledWith('hero-import-unsplash-filmstrip-0')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Shader',
      }),
    )
    expect(openModalMock).toHaveBeenCalledWith('hero-select-shader-filmstrip-0')
  })

  it('triggers the hidden file input and forwards the picked file for Upload Image', () => {
    const onUploadImage = vi.fn()
    const { container } = render(
      <AddSlideMenu
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={onUploadImage}
        onUploadVideo={noop}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Upload Image',
      }),
    )

    const fileInput = container.querySelector('input[type="file"][accept="image/*"]')
    expect(fileInput).toBeInTheDocument()

    const file = new File(
      [
        'x',
      ],
      'hero.png',
      {
        type: 'image/png',
      },
    )
    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [
          file,
        ],
      },
    })

    expect(onUploadImage).toHaveBeenCalledWith(file)
  })

  it('triggers the hidden file input and forwards the picked file for Upload Video', () => {
    const onUploadVideo = vi.fn()
    const { container } = render(
      <AddSlideMenu
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={onUploadVideo}
      />,
    )

    const fileInput = container.querySelector('input[type="file"][accept="video/*"]')
    expect(fileInput).toBeInTheDocument()

    const file = new File(
      [
        'x',
      ],
      'hero.mp4',
      {
        type: 'video/mp4',
      },
    )
    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [
          file,
        ],
      },
    })

    expect(onUploadVideo).toHaveBeenCalledWith(file)
  })

  it('disables the trigger button when disabled is set', () => {
    render(
      <AddSlideMenu
        disabled
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
      />,
    )

    expect(screen.getByText('+ Add Hero BG').closest('button')).toBeDisabled()
  })

  it('renders each of the four picker drawers, scoped to this menu instance', () => {
    render(
      <AddSlideMenu
        menuId="filmstrip-2"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
      />,
    )

    expect(screen.getByTestId('select-media-drawer-image')).toHaveTextContent(
      'hero-select-image-filmstrip-2',
    )
    expect(screen.getByTestId('select-media-drawer-video')).toHaveTextContent(
      'hero-select-video-filmstrip-2',
    )
    expect(screen.getByTestId('select-unsplash-drawer')).toHaveTextContent(
      'hero-import-unsplash-filmstrip-2',
    )
    expect(screen.getByTestId('shader-picker-drawer')).toHaveTextContent(
      'hero-select-shader-filmstrip-2',
    )
  })

  it('renders a custom trigger instead of the default button when renderTrigger is set', () => {
    render(
      <AddSlideMenu
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
        renderTrigger={<span>Replace this slide</span>}
      />,
    )

    expect(screen.queryByText('+ Add Hero BG')).not.toBeInTheDocument()
    expect(screen.getByText('Replace this slide')).toBeInTheDocument()
  })

  it('hides the menu content while open is explicitly false', () => {
    render(
      <AddSlideMenu
        menuId="test"
        onSelectImage={noop}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
        open={false}
        renderTrigger={<span>Replace this slide</span>}
      />,
    )

    expect(screen.queryByText('Select Image')).not.toBeInTheDocument()
  })

  it('notifies onOpenChange(true) when forced open, and onOpenChange(false) when an action is chosen', () => {
    const onOpenChange = vi.fn()
    const onSelectImage = vi.fn()

    render(
      <AddSlideMenu
        menuId="test"
        onOpenChange={onOpenChange}
        onSelectImage={onSelectImage}
        onSelectShader={noop}
        onSelectUnsplash={noop}
        onSelectVideo={noop}
        onUploadImage={noop}
        onUploadVideo={noop}
        open
        renderTrigger={<span>Replace this slide</span>}
      />,
    )

    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select Image',
      }),
    )

    expect(openModalMock).toHaveBeenCalledWith('hero-select-image-test')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

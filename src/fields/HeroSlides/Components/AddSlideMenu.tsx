'use client'

import { useCallback, useRef } from 'react'
import { Button, Popup, PopupList, useDrawerSlug, useModal } from '@payloadcms/ui'

import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'
import type { MediaImage, MediaVideo } from '@/types/payload'

import { SelectMediaDrawer } from './SelectMediaDrawer'
import { SelectUnsplashDrawer } from './SelectUnsplashDrawer'
import { ShaderPickerDrawer } from './ShaderPickerDrawer'

export interface AddSlideMenuProps {
  /** A stable id for this menu instance — keeps its drawer slugs from colliding when several menus exist on the same page (the trailing `+`, each between-slide `+`, and each row's "Replace"). */
  menuId: string
  /** The id of a slide row currently mid-upload/import — disables Unsplash results while it runs (a second import shouldn't start until the first resolves). */
  importingId?: string | null
  onSelectImage: (doc: MediaImage) => void
  onSelectVideo: (doc: MediaVideo) => void
  onSelectShader: (key: ShaderPresetKey) => void
  onSelectUnsplash: (result: UnsplashSearchResult) => void
  onUploadImage: (file: File) => void
  onUploadVideo: (file: File) => void
  disabled?: boolean
  /**
   * Renders a custom trigger instead of the default "+ Add Hero BG" button —
   * used by `SlideThumb`'s "Replace" action, which opens this same menu from
   * its own hover-toolbar icon rather than a visible trigger of its own.
   */
  renderTrigger?: React.ReactNode
  /** Externally controls the menu's open state (`Popup`'s `forceOpen`) — paired with `renderTrigger` so a caller with its own trigger element can open/close the menu itself. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * The "+" add-slide dropdown: Select/Upload Image, Select/Upload Video,
 * Import Unsplash, Select Shader — six concrete actions in one menu rather
 * than the old two-step "pick a type, then a field appears" flow.
 *
 * "Select"/"Import" actions open one of the shared `MediaPickerDrawer`
 * sources; "Upload" actions trigger a native `<input type="file">` and hand
 * the chosen `File` back to the caller, which owns the optimistic
 * background-upload flow (see the array-editor's field wiring) — this
 * component only dispatches the six actions, it holds no upload state itself.
 */
export const AddSlideMenu = ({
  menuId,
  importingId = null,
  onSelectImage,
  onSelectVideo,
  onSelectShader,
  onSelectUnsplash,
  onUploadImage,
  onUploadVideo,
  disabled,
  renderTrigger,
  open,
  onOpenChange,
}: AddSlideMenuProps) => {
  const { openModal } = useModal()
  const imageDrawerSlug = useDrawerSlug(`hero-select-image-${menuId}`)
  const videoDrawerSlug = useDrawerSlug(`hero-select-video-${menuId}`)
  const unsplashDrawerSlug = useDrawerSlug(`hero-import-unsplash-${menuId}`)
  const shaderDrawerSlug = useDrawerSlug(`hero-select-shader-${menuId}`)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Payload's `Popup` re-derives its internal `setActive` callback from
  // `onToggleOpen`/`onToggleClose` every render, and its own `forceOpen`
  // effect depends on that callback's identity — so passing new inline
  // closures here on every render re-triggers that effect every render,
  // which sets state, which re-renders, forever (only observable once a
  // caller actually passes `open`, since `forceOpen`'s effect is a no-op
  // otherwise). Must stay referentially stable across renders.
  const handleToggleClose = useCallback(
    () => onOpenChange?.(false),
    [
      onOpenChange,
    ],
  )
  const handleToggleOpen = useCallback(
    () => onOpenChange?.(true),
    [
      onOpenChange,
    ],
  )

  return (
    <>
      <Popup
        button={
          renderTrigger ?? (
            <Button buttonStyle="secondary" disabled={disabled} size="small" type="button">
              + Add Hero BG
            </Button>
          )
        }
        buttonType="custom"
        forceOpen={open}
        horizontalAlign="left"
        onToggleClose={handleToggleClose}
        onToggleOpen={handleToggleOpen}
        render={({ close }) => (
          <PopupList.ButtonGroup>
            <PopupList.GroupLabel label="Image" />
            <PopupList.Button
              onClick={() => {
                close()
                openModal(imageDrawerSlug)
              }}
            >
              Select Image
            </PopupList.Button>
            <PopupList.Button
              onClick={() => {
                close()
                imageInputRef.current?.click()
              }}
            >
              Upload Image
            </PopupList.Button>

            <PopupList.Divider />

            <PopupList.GroupLabel label="Video" />
            <PopupList.Button
              onClick={() => {
                close()
                openModal(videoDrawerSlug)
              }}
            >
              Select Video
            </PopupList.Button>
            <PopupList.Button
              onClick={() => {
                close()
                videoInputRef.current?.click()
              }}
            >
              Upload Video
            </PopupList.Button>

            <PopupList.Divider />

            <PopupList.Button
              onClick={() => {
                close()
                openModal(unsplashDrawerSlug)
              }}
            >
              Import Unsplash
            </PopupList.Button>

            <PopupList.Divider />

            <PopupList.Button
              onClick={() => {
                close()
                openModal(shaderDrawerSlug)
              }}
            >
              Select Shader
            </PopupList.Button>
          </PopupList.ButtonGroup>
        )}
      />

      {/* Hidden native file inputs for the two Upload actions. `key` resets
          the input after each pick so choosing the same file twice in a row
          still fires `onChange`. */}
      <input
        accept="image/*"
        className="sr-only"
        key={`image-input-${importingId}`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onUploadImage(file)
          event.target.value = ''
        }}
        ref={imageInputRef}
        type="file"
      />
      <input
        accept="video/*"
        className="sr-only"
        key={`video-input-${importingId}`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onUploadVideo(file)
          event.target.value = ''
        }}
        ref={videoInputRef}
        type="file"
      />

      <SelectMediaDrawer kind="image" onSelectAction={onSelectImage} slug={imageDrawerSlug} />
      <SelectMediaDrawer kind="video" onSelectAction={onSelectVideo} slug={videoDrawerSlug} />
      <SelectUnsplashDrawer
        importingId={importingId}
        onSelectAction={onSelectUnsplash}
        slug={unsplashDrawerSlug}
      />
      <ShaderPickerDrawer onSelectAction={onSelectShader} slug={shaderDrawerSlug} />
    </>
  )
}

export default AddSlideMenu

'use client'

import dynamic from 'next/dynamic'
import type { SelectFieldClientProps } from 'payload'
import { Button, FieldError, FieldLabel, useDrawerSlug, useField, useModal } from '@payloadcms/ui'

import { SHADER_PRESET_MAP, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPickerDrawer = dynamic(() => import('./ShaderPickerDrawer'), {
  ssr: false,
})
const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

/**
 * Admin control for `HeroSlidesField`'s per-row `shader` sub-field. Shows the
 * current selection (label + a small live preview) and a button to open the
 * full picker drawer.
 *
 * `path` is already row-qualified by Payload (e.g. `slides.0.shader`), so
 * `useField` here reads/writes only this row's value.
 */
const HeroSlideShaderField = ({ path, field, readOnly }: SelectFieldClientProps) => {
  const { value, setValue, showError, errorMessage } = useField<ShaderPresetKey>({
    path,
  })
  const { openModal } = useModal()
  const drawerSlug = useDrawerSlug(`hero-shader-picker-${path}`)

  const selectedPreset = value ? SHADER_PRESET_MAP[value] : undefined

  return (
    <div className="field-type">
      <FieldLabel label={field?.label ?? 'Shader'} path={path} required={field?.required} />

      <div className="flex items-center gap-3">
        {selectedPreset ? (
          <div className="h-16 w-24 overflow-hidden rounded-md border border-input">
            <ShaderPreviewCanvas
              className="h-full w-full"
              entry={SHADER_COMPONENTS[selectedPreset.key]}
            />
          </div>
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted-foreground">
            None
          </div>
        )}

        <Button
          buttonStyle="secondary"
          disabled={readOnly}
          onClick={() => openModal(drawerSlug)}
          size="small"
          type="button"
        >
          {selectedPreset ? `Change (${selectedPreset.label})` : 'Choose a shader…'}
        </Button>
      </div>

      {!readOnly && (
        <ShaderPickerDrawer
          onSelectAction={(key) => setValue(key)}
          slug={drawerSlug}
          value={value}
        />
      )}

      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export default HeroSlideShaderField

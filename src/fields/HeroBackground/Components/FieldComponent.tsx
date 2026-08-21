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
 * Payload admin control for `HeroBackgroundField`'s `shader` sub-field.
 * Shows the current selection (label + a small live preview) and a button
 * to open the full picker drawer.
 *
 * Structurally modeled on `src/fields/Icon/Field.tsx` — `useField` for the
 * value, `useModal`/`useDrawerSlug` to open a `Drawer`, pick-and-close.
 */
const HeroBackgroundShaderField = ({ path, field }: SelectFieldClientProps) => {
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
              entry={SHADER_COMPONENTS[selectedPreset.key]}
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted-foreground">
            None
          </div>
        )}

        <Button
          type="button"
          buttonStyle="secondary"
          size="small"
          onClick={() => openModal(drawerSlug)}
        >
          {selectedPreset ? `Change (${selectedPreset.label})` : 'Choose a shader…'}
        </Button>
      </div>

      <ShaderPickerDrawer slug={drawerSlug} value={value} onSelectAction={(key) => setValue(key)} />

      <FieldError showError={showError} message={errorMessage} path={path} />
    </div>
  )
}

export default HeroBackgroundShaderField

'use client'

import dynamic from 'next/dynamic'
import { Drawer, useModal } from '@payloadcms/ui'

import { SHADER_PRESETS, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

export interface ShaderPickerDrawerProps {
  slug: string
  value?: ShaderPresetKey
  onSelectAction: (key: ShaderPresetKey) => void
}

/**
 * Grid of preset cards inside Payload's Drawer, each rendering its shader
 * live — not a static screenshot. Click a card to select it and close the
 * drawer, matching Payload's own block-picker's pick-and-close flow.
 *
 * Running up to 4 live WebGL contexts at once here is intentional (per the
 * design's confirmed choice) — dynamic-imported with `ssr: false` since the
 * shader components touch `window` outside of any effect.
 */
export const ShaderPickerDrawer = ({ slug, value, onSelectAction }: ShaderPickerDrawerProps) => {
  const { closeModal } = useModal()

  return (
    <Drawer slug={slug} title="Select a shader background">
      <div className="grid grid-cols-2 gap-4">
        {SHADER_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => {
              onSelectAction(preset.key)
              closeModal(slug)
            }}
            aria-pressed={value === preset.key}
            className="flex flex-col gap-2 rounded-md border border-input p-2 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary"
          >
            <div className="aspect-video w-full overflow-hidden rounded-sm">
              <ShaderPreviewCanvas
                entry={SHADER_COMPONENTS[preset.key]}
                className="h-full w-full"
              />
            </div>
            <span className="text-sm font-medium">{preset.label}</span>
          </button>
        ))}
      </div>
    </Drawer>
  )
}

export default ShaderPickerDrawer

'use client'

import type { ShaderComponentEntry } from './shaderComponents'

export type ShaderPreviewCanvasProps = {
  entry: ShaderComponentEntry
  className?: string
}

/**
 * Renders one shader preset live, sized to fill its container. Used both by
 * the picker drawer's grid (many small instances at once) and the field's
 * own "currently selected" summary (one instance).
 *
 * The shader components read `window` at default-parameter-evaluation time,
 * not just inside effects — this file must only ever be reached through a
 * `next/dynamic(..., { ssr: false })` boundary (see FieldComponent.tsx),
 * never imported statically into anything that could render on the server.
 */
export const ShaderPreviewCanvas = ({ entry, className }: ShaderPreviewCanvasProps) => {
  const { Component, props } = entry

  return (
    <div className={className}>
      <Component {...props} />
    </div>
  )
}

export default ShaderPreviewCanvas

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
 * `next/dynamic(..., { ssr: false })` boundary (see ShaderSlideField.tsx),
 * never imported statically into anything that could render on the server.
 */
const renderShader = (entry: ShaderComponentEntry) => {
  switch (entry.key) {
    case 'crt-warp':
      return <entry.Component {...entry.props} />
    case 'darkveil':
      return <entry.Component {...entry.props} />
    case 'dither':
      return <entry.Component {...entry.props} />
    case 'faulty-terminal':
      return <entry.Component {...entry.props} />
    case 'gradient-blinds':
      return <entry.Component {...entry.props} />
    case 'grainient':
      return <entry.Component {...entry.props} />
    case 'pixel-blast':
      return <entry.Component {...entry.props} />
    case 'silk':
      return <entry.Component {...entry.props} />
  }
}

export const ShaderPreviewCanvas = ({ entry, className }: ShaderPreviewCanvasProps) => {
  return <div className={className}>{renderShader(entry)}</div>
}

export default ShaderPreviewCanvas

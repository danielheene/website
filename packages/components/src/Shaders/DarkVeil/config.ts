import type { DarkVeilProps } from './DarkVeil'

/**
 * Curated prop bundle for the DarkVeil shader when used as a full-bleed
 * hero background — slow motion, low noise, subtle warp.
 */
export const defaultProps: DarkVeilProps = {
  hueShift: 0,
  noiseIntensity: 0.02,
  scanlineIntensity: 0,
  speed: 0.3,
  warpAmount: 0.1,
}

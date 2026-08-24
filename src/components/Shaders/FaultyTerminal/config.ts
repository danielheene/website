import type { FaultyTerminalProps } from './FaultyTerminal'

/**
 * Curated prop bundle for the FaultyTerminal shader when used as a full-bleed
 * hero background — white tint, subtle scanlines, moderate glitch and flicker.
 */
export const defaultProps: FaultyTerminalProps = {
  scale: 2.4,
  digitSize: 0.5,
  scanlineIntensity: 0.05,
  glitchAmount: 1.6,
  flickerAmount: 1.9,
  noiseAmp: 0.5,
  chromaticAberration: 0,
  dither: 0.05,
  curvature: 0.25,
  tint: '#fff',
  mouseReact: false,
  mouseStrength: 0.65,
  brightness: 1.1,
  pageLoadAnimation: false,
}

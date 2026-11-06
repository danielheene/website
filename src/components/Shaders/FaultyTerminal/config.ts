import type { FaultyTerminalProps } from './FaultyTerminal'

export const defaultProps: FaultyTerminalProps = {
  tint: '#A7EF9E',
  glyphs: 'blocks',
  scale: 1.5,
  digitSize: 1.2,
  timeScale: 0.5,
  brightness: 0.75,
  glow: 0.5,
  persistence: 0.5,
  mouseStrength: 0.5,
  mouseGlow: 0.6,
  curvature: 0.1,
  vignette: 0.25,
  clickEffect: 'glitch',
  scanlineIntensity: 0.5,
}

export const phosphorPreset: FaultyTerminalProps = {
  ...defaultProps,
}

export const classicPreset: FaultyTerminalProps = {
  tint: '#A7EF9E',
  glyphs: 'blocks',
  scale: 1.5,
  digitSize: 1.2,
  timeScale: 0.5,
  brightness: 0.6,
  glow: 0,
  persistence: 0,
  mouseStrength: 0.5,
  mouseGlow: 0,
  curvature: 0.1,
  vignette: 0,
  clickEffect: 'none',
  scanlineIntensity: 0.5,
}

export const terminalPreset: FaultyTerminalProps = {
  tint: '#B8F5A8',
  glyphs: 'characters',
  scale: 1.2,
  digitSize: 1.15,
  timeScale: 0.5,
  brightness: 0.85,
  glow: 0.5,
  persistence: 0.5,
  mouseStrength: 0.5,
  mouseGlow: 0.6,
  curvature: 0.1,
  vignette: 0.25,
  clickEffect: 'glitch',
  scramble: 0.6,
  scanlineIntensity: 0.5,
}

export const amberPreset: FaultyTerminalProps = {
  tint: '#FFB347',
  glyphs: 'dots',
  scale: 1.6,
  digitSize: 1.25,
  timeScale: 0.5,
  brightness: 0.8,
  glow: 0.6,
  persistence: 0.5,
  mouseStrength: 0.5,
  mouseGlow: 0.6,
  curvature: 0.1,
  vignette: 0.25,
  clickEffect: 'degauss',
  scanlineIntensity: 0.5,
}

export const icePreset: FaultyTerminalProps = {
  tint: '#7DD3FC',
  glyphs: 'blocks',
  scale: 2.2,
  digitSize: 1.3,
  timeScale: 0.35,
  brightness: 0.85,
  glow: 0.7,
  persistence: 0.85,
  mouseStrength: 0.5,
  mouseGlow: 0.8,
  curvature: 0.1,
  vignette: 0.25,
  clickEffect: 'glitch',
  scanlineIntensity: 0.5,
}

export const meltdownPreset: FaultyTerminalProps = {
  tint: '#F4F4F5',
  glyphs: 'blocks',
  scale: 1.3,
  digitSize: 1.2,
  timeScale: 0.8,
  brightness: 0.7,
  glow: 0.5,
  persistence: 0.5,
  mouseStrength: 0.5,
  mouseGlow: 0.6,
  curvature: 0.25,
  vignette: 0.45,
  clickEffect: 'glitch',
  scanlineIntensity: 0.5,
  glitchAmount: 3,
  flickerAmount: 2,
  noiseAmp: 1.3,
  chromaticAberration: 1.5,
}

export const dataPreset: FaultyTerminalProps = {
  tint: '#E4E4E7',
  glyphs: 'characters',
  scale: 2.4,
  digitSize: 1.1,
  timeScale: 0.5,
  brightness: 0.7,
  glow: 0.35,
  persistence: 0.5,
  mouseStrength: 0.5,
  mouseGlow: 0.6,
  curvature: 0,
  vignette: 0.25,
  clickEffect: 'glitch',
  scramble: 0.9,
  scanlineIntensity: 0.5,
}

export const faultyTerminalPresets = {
  Phosphor: phosphorPreset,
  Classic: classicPreset,
  Terminal: terminalPreset,
  Amber: amberPreset,
  Ice: icePreset,
  Meltdown: meltdownPreset,
  Data: dataPreset,
}

export const presets = {
  default: defaultProps,
  phosphor: phosphorPreset,
  classic: classicPreset,
  terminal: terminalPreset,
  amber: amberPreset,
  ice: icePreset,
  meltdown: meltdownPreset,
  data: dataPreset,
} as const satisfies Record<string, FaultyTerminalProps>

import type { DarkVeilProps } from './DarkVeil'

export const defaultProps: DarkVeilProps = {
  color: '#ffffff',
  speed: 0.5,
  scale: 1,
  rotation: 0,
  flow: 1,
  warp: 0,
  variation: 0,
  brightness: 1,
  sheen: 0.5,
  glow: 0.4,
  grain: 0.2,
  quality: 1,
  mouseInteraction: true,
  mouseStrength: 1,
  intro: true,
  fade: 0,
  opacity: 1,
  lightMode: false,
}

export const veilPreset: DarkVeilProps = {
  ...defaultProps,
}

export const emberPreset: DarkVeilProps = {
  ...defaultProps,
  color: '#ff4d1a',
  variation: 3,
}

export const jadePreset: DarkVeilProps = {
  ...defaultProps,
  color: '#10b981',
  rotation: 180,
  variation: 7,
  glow: 0.6,
}

export const silverPreset: DarkVeilProps = {
  ...defaultProps,
  color: '#b4b4c4',
  glow: 0.2,
}

export const stormPreset: DarkVeilProps = {
  ...defaultProps,
  color: '#3d5afe',
  speed: 1,
  flow: 2.2,
  warp: 0.6,
  variation: 5,
}

export const darkVeilPresets = {
  Veil: veilPreset,
  Ember: emberPreset,
  Jade: jadePreset,
  Silver: silverPreset,
  Storm: stormPreset,
}

export const presets = {
  default: defaultProps,
  veil: veilPreset,
  ember: emberPreset,
  jade: jadePreset,
  silver: silverPreset,
  storm: stormPreset,
} as const satisfies Record<string, DarkVeilProps>

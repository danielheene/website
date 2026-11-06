import type { GrainientProps } from './Grainient'

/**
 * Curated prop bundle for the Grainient shader when used as a full-bleed
 * hero background — rich warm sunset tones with gentle flowing silk and grain.
 */
export const defaultProps: GrainientProps = {
  colors: ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'],
  angle: 55,
  flow: 0.8,
  silk: 0.35,
  grainAmount: 0.08,
}

export const emberPreset: GrainientProps = {
  colors: ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'],
  angle: 55,
  flow: 0.8,
  silk: 0.35,
  grainAmount: 0.08,
}

export const lagoonPreset: GrainientProps = {
  colors: ['#071318', '#0e7490', '#2dd4bf', '#ccfbf1'],
  angle: 20,
  flow: 0.9,
  silk: 0.35,
  grainAmount: 0.08,
}

export const duskPreset: GrainientProps = {
  colors: ['#120f17', '#3f0d1a', '#be123c', '#fb923c', '#fde68a'],
  angle: 150,
  flow: 0.8,
  silk: 0.4,
  grainAmount: 0.08,
}

export const satinPreset: GrainientProps = {
  colors: ['#0c0c0f', '#3f3f46', '#a1a1aa', '#fafafa'],
  angle: 40,
  flow: 0.8,
  silk: 1,
  grainAmount: 0.08,
  bands: 2,
}

export const dunesPreset: GrainientProps = {
  colors: ['#120f17', '#451a03', '#b45309', '#fbbf24', '#fef3c7'],
  angle: 70,
  flow: 0.8,
  silk: 0,
  grainAmount: 0.12,
  bands: 2,
  softness: 0.08,
  scale: 1.2,
  grainSize: 1.8,
}

export const tidePreset: GrainientProps = {
  colors: ['#06101f', '#0c4a6e', '#0284c7', '#7dd3fc', '#f0f9ff'],
  angle: 0,
  flow: 0.7,
  silk: 0.3,
  grainAmount: 0.08,
  bands: 3,
  softness: 0.25,
}

export const grainientPresets = {
  Ember: emberPreset,
  Lagoon: lagoonPreset,
  Dusk: duskPreset,
  Satin: satinPreset,
  Dunes: dunesPreset,
  Tide: tidePreset,
}

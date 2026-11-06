import type { DitherProps } from './Dither'

/**
 * Curated prop bundle for the Dither shader when used as a full-bleed
 * hero background — monochrome Bayer 8x8 matrix dithering with interactive ripples.
 */
export const defaultProps: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'bayer',
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'erase',
  mouseRadius: 0.3,
  palette: [],
}

export const classicPreset: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'bayer',
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'erase',
  mouseRadius: 0.3,
  palette: [],
}

export const gameBoyPreset: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'bayer',
  colorNum: 4,
  pixelSize: 3,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'erase',
  mouseRadius: 0.3,
  palette: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
}

export const newsprintPreset: DitherProps = {
  waveColor: '#141414',
  backgroundColor: '#efeae0',
  ditherMode: 'halftone',
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'reveal',
  mouseRadius: 0.3,
  contrast: 1.3,
  palette: [],
}

export const amberPreset: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'lines',
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'erase',
  mouseRadius: 0.3,
  scale: 1.2,
  palette: ['#0b0603', '#5c2e05', '#d97706', '#ffd08a'],
}

export const blueprintPreset: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'crosshatch',
  colorNum: 4,
  pixelSize: 2,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'ripple',
  mouseRadius: 0.45,
  palette: ['#0d2a57', '#24508f', '#8fb5ea', '#e8f1ff'],
}

export const staticPreset: DitherProps = {
  waveColor: '#bcbcbc',
  backgroundColor: '#120f17',
  ditherMode: 'noise',
  colorNum: 2,
  pixelSize: 1,
  waveSpeed: 0.12,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  mouseEffect: 'erase',
  mouseRadius: 0.3,
  contrast: 1.3,
  palette: [],
}

export const ditherPresets = {
  Classic: classicPreset,
  GameBoy: gameBoyPreset,
  Newsprint: newsprintPreset,
  Amber: amberPreset,
  Blueprint: blueprintPreset,
  Static: staticPreset,
}

export const presets = {
  default: defaultProps,
  classic: classicPreset,
  gameBoy: gameBoyPreset,
  newsprint: newsprintPreset,
  amber: amberPreset,
  blueprint: blueprintPreset,
  static: staticPreset,
} as const satisfies Record<string, DitherProps>

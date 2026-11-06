import type { PixelBlastProps } from './PixelBlast'

export const defaultProps: PixelBlastProps = {
  variant: 'square',
  pixelSize: 3,
  color: '#B497CF',
  patternScale: 2,
  patternDensity: 1,
  softness: 0.6,
  glow: 0.4,
  twinkle: 0.25,
  drift: 0.2,
  hoverEffect: 'reveal',
  enableRipples: true,
  edgeFade: 0.25,
}

export const blastPreset: PixelBlastProps = {
  ...defaultProps,
}

export const classicPreset: PixelBlastProps = {
  variant: 'square',
  pixelSize: 3,
  color: '#B497CF',
  patternScale: 2,
  patternDensity: 1,
  softness: 0,
  glow: 0,
  twinkle: 0,
  drift: 0,
  hoverEffect: 'none',
  enableRipples: true,
  edgeFade: 0.25,
  smoothing: 0,
}

export const monoPreset: PixelBlastProps = {
  variant: 'square',
  pixelSize: 2,
  color: '#71717A',
  patternScale: 2.6,
  patternDensity: 1.1,
  softness: 0.6,
  glow: 0.3,
  twinkle: 0.25,
  drift: 0.2,
  hoverEffect: 'grow',
  enableRipples: true,
  edgeFade: 0.25,
  accentColor: '#F4F4F5',
}

export const emberPreset: PixelBlastProps = {
  variant: 'square',
  pixelSize: 3,
  color: '#9A3412',
  patternScale: 1.6,
  patternDensity: 1.15,
  softness: 0.6,
  glow: 0.6,
  twinkle: 0.4,
  drift: 0.35,
  hoverEffect: 'reveal',
  enableRipples: true,
  edgeFade: 0.25,
  accentColor: '#FDBA74',
  driftAngle: 90,
}

export const dotsPreset: PixelBlastProps = {
  variant: 'circle',
  pixelSize: 7,
  color: '#7DD3FC',
  patternScale: 2.4,
  patternDensity: 1.25,
  softness: 1,
  glow: 0.3,
  twinkle: 0.25,
  drift: 0.2,
  hoverEffect: 'reveal',
  enableRipples: true,
  edgeFade: 0.25,
  accentColor: '#E0F2FE',
  pixelSizeJitter: 0.5,
}

export const starsPreset: PixelBlastProps = {
  variant: 'cross',
  pixelSize: 6,
  color: '#A1A1AA',
  patternScale: 3,
  patternDensity: 1.1,
  softness: 0.6,
  glow: 0.2,
  twinkle: 0.75,
  drift: 0.2,
  hoverEffect: 'grow',
  enableRipples: true,
  edgeFade: 0.25,
  accentColor: '#FDE68A',
  pixelSizeJitter: 0.6,
  speed: 0.3,
}

export const horizonPreset: PixelBlastProps = {
  variant: 'square',
  pixelSize: 3,
  color: '#B497CF',
  patternScale: 2,
  patternDensity: 1.1,
  softness: 0.6,
  glow: 0.4,
  twinkle: 0.25,
  drift: 0.6,
  hoverEffect: 'reveal',
  enableRipples: true,
  edgeFade: 0.15,
  driftAngle: 90,
  tiltX: 58,
}

export const stormPreset: PixelBlastProps = {
  variant: 'square',
  pixelSize: 3,
  color: '#818CF8',
  patternScale: 2.4,
  patternDensity: 1,
  softness: 0.6,
  glow: 0.5,
  twinkle: 0.25,
  drift: 0.2,
  hoverEffect: 'grow',
  enableRipples: true,
  edgeFade: 0.25,
  accentColor: '#E0E7FF',
  speed: 1,
  rippleSpeed: 0.45,
  rippleIntensityScale: 1.4,
  autoRipple: 1.6,
}

export const pixelBlastPresets = {
  Blast: blastPreset,
  Classic: classicPreset,
  Mono: monoPreset,
  Ember: emberPreset,
  Dots: dotsPreset,
  Stars: starsPreset,
  Horizon: horizonPreset,
  Storm: stormPreset,
}

export const presets = {
  default: defaultProps,
  blast: blastPreset,
  classic: classicPreset,
  mono: monoPreset,
  ember: emberPreset,
  dots: dotsPreset,
  stars: starsPreset,
  horizon: horizonPreset,
  storm: stormPreset,
} as const satisfies Record<string, PixelBlastProps>

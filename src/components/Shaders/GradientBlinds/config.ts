import type { GradientBlindsProps } from './GradientBlinds'

export const defaultProps: GradientBlindsProps = {
  gradientColors: ['#FF9FFC', '#5227FF'],
  angle: 20,
  blindCount: 16,
  blindMinWidth: 60,
  spotlightRadius: 0.5,
  shine: 0.4,
  relief: 0.5,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
}

export const satinPreset: GradientBlindsProps = {
  ...defaultProps,
}

export const classicPreset: GradientBlindsProps = {
  gradientColors: ['#FF9FFC', '#5227FF'],
  angle: 20,
  blindCount: 16,
  blindMinWidth: 60,
  spotlightRadius: 0.5,
  shine: 0,
  relief: 0,
  glow: 0,
  sway: 0,
  hoverTilt: 0,
  clickEffect: 'none',
  noise: 0.3,
  idle: 'stay',
}

export const noirPreset: GradientBlindsProps = {
  gradientColors: ['#f4f4f5', '#71717a'],
  angle: -14,
  blindCount: 14,
  blindMinWidth: 60,
  spotlightRadius: 0.62,
  shine: 0.8,
  relief: 0.75,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.4,
  lightColor: '#ffe4c4',
  spotlightSoftness: 1.3,
}

export const sunsetPreset: GradientBlindsProps = {
  gradientColors: ['#ffb347', '#ff6b3d', '#c2185b'],
  angle: 32,
  blindCount: 16,
  blindMinWidth: 60,
  spotlightRadius: 0.6,
  shine: 0.4,
  relief: 0.5,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
  lightColor: '#ffd8b0',
}

export const lagoonPreset: GradientBlindsProps = {
  gradientColors: ['#5eead4', '#0ea5e9', '#1e3a8a'],
  angle: -24,
  blindCount: 16,
  blindMinWidth: 60,
  spotlightRadius: 0.5,
  shine: 0.4,
  relief: 0.5,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
  lightColor: '#e0f2fe',
}

export const venetianPreset: GradientBlindsProps = {
  gradientColors: ['#FF9FFC', '#5227FF'],
  angle: 0,
  blindCount: 40,
  blindMinWidth: 18,
  spotlightRadius: 0.55,
  shine: 0.7,
  relief: 0.6,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
}

export const perspectivePreset: GradientBlindsProps = {
  gradientColors: ['#FF9FFC', '#5227FF'],
  angle: 0,
  blindCount: 22,
  blindMinWidth: 20,
  spotlightRadius: 0.5,
  shine: 0.6,
  relief: 0.5,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
  perspective: 0.7,
}

export const driftPreset: GradientBlindsProps = {
  gradientColors: ['#ff9ffc', '#5227ff', '#22d3ee'],
  angle: 20,
  blindCount: 16,
  blindMinWidth: 60,
  spotlightRadius: 0.5,
  shine: 0.4,
  relief: 0.5,
  glow: 0.4,
  sway: 0.35,
  hoverTilt: 0.6,
  clickEffect: 'ripple',
  noise: 0.3,
  gradientSpeed: 1.5,
  distortAmount: 12,
}

export const gradientBlindsPresets = {
  Satin: satinPreset,
  Classic: classicPreset,
  Noir: noirPreset,
  Sunset: sunsetPreset,
  Lagoon: lagoonPreset,
  Venetian: venetianPreset,
  Perspective: perspectivePreset,
  Drift: driftPreset,
}

export const presets = {
  default: defaultProps,
  satin: satinPreset,
  classic: classicPreset,
  noir: noirPreset,
  sunset: sunsetPreset,
  lagoon: lagoonPreset,
  venetian: venetianPreset,
  perspective: perspectivePreset,
  drift: driftPreset,
} as const satisfies Record<string, GradientBlindsProps>

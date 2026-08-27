import type { GradientBlindsProps } from './GradientBlinds'

/**
 * Curated prop bundle for the GradientBlinds shader when used as a full-bleed
 * hero background — pink-to-purple palette, slight angle, gentle noise.
 */
export const defaultProps: GradientBlindsProps = {
  gradientColors: [
    '#FF9FFC',
    '#5227FF',
  ],
  angle: 15,
  noise: 0.15,
  blindCount: 12,
  mouseDampening: 0.15,
}

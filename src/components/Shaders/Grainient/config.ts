import type { GrainientProps } from './Grainient'

/**
 * Curated prop bundle for the Grainient shader when used as a full-bleed
 * hero background — pink/purple/lilac trio, slow motion, subtle grain.
 */
export const defaultProps: GrainientProps = {
  color1: '#FF9FFC',
  color2: '#5227FF',
  color3: '#B497CF',
  timeSpeed: 0.15,
  grainAmount: 0.06,
}

import { describe, expect, it } from 'vitest'

import { Silk, defaultProps, presets } from './index'

describe('Silk shader component', () => {
  it('exports the Silk component and defaultProps', () => {
    expect(Silk).toBeDefined()
    expect(defaultProps).toBeDefined()
    expect(defaultProps.color).toBe('#7B7481')
    expect(defaultProps.sheenColor).toBe('#ffffff')
    expect(defaultProps.speed).toBe(5)
  })

  it('provides all curated presets with valid configuration', () => {
    expect(presets.default).toEqual(defaultProps)
    expect(presets.electricViolet).toBeDefined()
    expect(presets.crimsonVelvet).toBeDefined()
    expect(presets.goldenSatin).toBeDefined()
    expect(presets.emeraldWeave).toBeDefined()
    expect(presets.midnightObsidian).toBeDefined()
    expect(presets.pearlLight).toBeDefined()

    for (const [key, preset] of Object.entries(presets)) {
      expect(preset.color, `Preset ${key} has color`).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(preset.sheenColor, `Preset ${key} has sheenColor`).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

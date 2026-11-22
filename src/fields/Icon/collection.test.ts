import { describe, expect, it } from 'vitest'

import { parseCollection } from './collection'

describe('parseCollection', () => {
  it('qualifies flat sets and declares no categories', () => {
    // simple-icons/lucide/radix-icons/fad shape: everything uncategorized
    const { icons, categories } = parseCollection('simple-icons', {
      uncategorized: ['github', 'gitlab'],
    })

    expect(icons).toEqual(['simple-icons:github', 'simple-icons:gitlab'])
    expect(categories).toEqual([])
  })

  it('splits categorised sets and keeps every icon in the flat list', () => {
    // material-symbols shape: all icons filed, nothing uncategorized
    const { icons, categories } = parseCollection('material-symbols', {
      uncategorized: [],
      categories: {
        Communication: ['call'],
        Actions: ['delete'],
      },
    })

    expect(categories.map((entry) => entry.label)).toEqual(['Actions', 'Communication'])
    expect(icons).toHaveLength(2)
    expect(icons).toContain('material-symbols:call')
    expect(icons).toContain('material-symbols:delete')
  })

  it('keeps loose icons reachable through an Uncategorized bucket', () => {
    // mdi shape: 61 categories plus 2,059 icons filed under none of them
    const { icons, categories } = parseCollection('mdi', {
      uncategorized: ['loose-icon'],
      categories: {
        Animal: ['cat'],
      },
    })

    expect(categories.map((entry) => entry.label)).toEqual(['Animal', 'Uncategorized'])
    expect(categories.at(-1)?.icons).toEqual(['mdi:loose-icon'])
    // the loose icon must still be browsable without picking a category
    expect(icons).toContain('mdi:loose-icon')
  })

  it('dedupes icons filed under more than one category', () => {
    const { icons } = parseCollection('material-symbols', {
      categories: {
        Actions: ['search'],
        Navigation: ['search'],
      },
    })

    // duplicate names would collide as React keys in the grid
    expect(icons).toEqual(['material-symbols:search'])
  })

  it('tolerates a response missing both fields', () => {
    expect(parseCollection('fad', {})).toEqual({
      icons: [],
      categories: [],
    })
  })
})

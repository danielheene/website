import { describe, expect, it } from 'vitest'

import { describeIcon, findIconAlias, resolveIconName } from './favorites'

describe('describeIcon', () => {
  it('pairs a bare alias with the name it resolves to', () => {
    expect(describeIcon('github')).toBe('github (simple-icons:github)')
  })

  it('describes a full Iconify name through its alias when one exists', () => {
    // stored as the full name, but it is the same icon as the `github` alias
    expect(describeIcon('simple-icons:github')).toBe('github (simple-icons:github)')
  })

  it('falls back to the raw name when no alias covers it', () => {
    expect(describeIcon('material-symbols:rocket-launch')).toBe('material-symbols:rocket-launch')
  })

  it('stays consistent with the resolver both forms render through', () => {
    // the two spellings must agree, or the picker shows neither as selected
    expect(resolveIconName('github')).toBe(resolveIconName('simple-icons:github'))
    expect(findIconAlias('simple-icons:github')).toBe('github')
  })
})

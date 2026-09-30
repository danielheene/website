import { describe, expect, it } from 'vitest'

import { SKILL_TYPE } from '@/types/select-options'

import { resolveSkillTagType } from './resolveSkillTagType'

describe('resolveSkillTagType', () => {
  it('returns the type most skills share', () => {
    expect(
      resolveSkillTagType([
        SKILL_TYPE.TESTING_AND_QUALITY,
        SKILL_TYPE.FRAMEWORKS_AND_LIBRARIES,
        SKILL_TYPE.FRAMEWORKS_AND_LIBRARIES,
      ]),
    ).toBe(SKILL_TYPE.FRAMEWORKS_AND_LIBRARIES)
  })

  it('breaks ties by SKILL_TYPE order, independent of input order', () => {
    const tie = [SKILL_TYPE.TESTING_AND_QUALITY, SKILL_TYPE.PROGRAMMING_LANGUAGES]

    expect(resolveSkillTagType(tie)).toBe(SKILL_TYPE.PROGRAMMING_LANGUAGES)
    expect(resolveSkillTagType([...tie].reverse())).toBe(SKILL_TYPE.PROGRAMMING_LANGUAGES)
  })

  it('ignores missing and unknown types', () => {
    expect(
      resolveSkillTagType([null, undefined, 'notAType', SKILL_TYPE.TOOLING_AND_PLATFORMS]),
    ).toBe(SKILL_TYPE.TOOLING_AND_PLATFORMS)
  })

  it('returns null without typed skills', () => {
    expect(resolveSkillTagType([])).toBeNull()
    expect(resolveSkillTagType([null])).toBeNull()
  })
})

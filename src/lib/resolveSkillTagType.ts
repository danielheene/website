import { SKILL_TYPE } from '@/types/select-options'

type SkillTypeValue = (typeof SKILL_TYPE)[keyof typeof SKILL_TYPE]

const SKILL_TYPE_ORDER: readonly string[] = Object.values(SKILL_TYPE)

/**
 * A skill tag's type is the type most of its skills share. Ties go to the type
 * listed first in `SKILL_TYPE`, so the result never depends on query order.
 * Returns `null` when no skill carries a type.
 */
export const resolveSkillTagType = (
  skillTypes: readonly (string | null | undefined)[],
): SkillTypeValue | null => {
  const counts = new Map<SkillTypeValue, number>()

  for (const type of skillTypes) {
    if (!type || !SKILL_TYPE_ORDER.includes(type)) continue
    const known = type as SkillTypeValue
    counts.set(known, (counts.get(known) ?? 0) + 1)
  }

  let resolved: SkillTypeValue | null = null
  for (const [type, count] of counts) {
    const best = resolved ? (counts.get(resolved) ?? 0) : 0
    if (
      count > best ||
      (count === best && SKILL_TYPE_ORDER.indexOf(type) < SKILL_TYPE_ORDER.indexOf(resolved))
    ) {
      resolved = type
    }
  }

  return resolved
}

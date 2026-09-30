import type { BadgeProps } from '@/components/Badge'
import { SKILL_TYPE } from '@/types/select-options'

/** One distinct Badge color per skill type, for dropdowns and list-view cells. */
export const SKILL_TYPE_BADGE_COLOR: Record<
  (typeof SKILL_TYPE)[keyof typeof SKILL_TYPE],
  NonNullable<BadgeProps['color']>
> = {
  [SKILL_TYPE.PROGRAMMING_LANGUAGES]: 'primary',
  [SKILL_TYPE.FRAMEWORKS_AND_LIBRARIES]: 'info',
  [SKILL_TYPE.TOOLING_AND_PLATFORMS]: 'success',
  [SKILL_TYPE.TESTING_AND_QUALITY]: 'warning',
  [SKILL_TYPE.ARCHITECTURE_AND_PATTERNS]: 'error',
  [SKILL_TYPE.METHODOLOGIES_AND_WORKING_PRACTICES]: 'neutral',
}

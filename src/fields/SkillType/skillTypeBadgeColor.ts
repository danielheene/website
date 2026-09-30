import type { BadgeProps } from '@/components/Badge'
import { SKILL_TYPE } from '@/types/select-options'

/**
 * One distinct Badge color per skill type, for dropdowns and list-view cells.
 * Picked from the hue gaps between the state colors (error, warning, success,
 * info/primary, neutral) so a skill type never reads as a status.
 */
export const SKILL_TYPE_BADGE_COLOR: Record<
  (typeof SKILL_TYPE)[keyof typeof SKILL_TYPE],
  NonNullable<BadgeProps['color']>
> = {
  [SKILL_TYPE.PROGRAMMING_LANGUAGES]: 'violet',
  [SKILL_TYPE.FRAMEWORKS_AND_LIBRARIES]: 'cyan',
  [SKILL_TYPE.TOOLING_AND_PLATFORMS]: 'lime',
  [SKILL_TYPE.TESTING_AND_QUALITY]: 'pink',
  [SKILL_TYPE.ARCHITECTURE_AND_PATTERNS]: 'fuchsia',
  [SKILL_TYPE.METHODOLOGIES_AND_WORKING_PRACTICES]: 'teal',
}

import { Badge } from '@/components/Badge'

import { SKILL_TYPE_BADGE_COLOR } from '../skillTypeBadgeColor'

type SkillTypeBadgeProps = {
  label: string
  value: string
}

export const SkillTypeBadge = ({ label, value }: SkillTypeBadgeProps) => {
  const color = SKILL_TYPE_BADGE_COLOR[value as keyof typeof SKILL_TYPE_BADGE_COLOR] ?? 'neutral'

  return (
    <Badge color={color} size="sm">
      {label}
    </Badge>
  )
}

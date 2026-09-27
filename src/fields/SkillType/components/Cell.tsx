import type { DefaultCellComponentProps, Option, SelectFieldClient } from 'payload'

import { SkillTypeBadge } from './SkillTypeBadge'

const labelFor = (options: Option[] | undefined, value: string): string => {
  const option = options?.find((opt) => (typeof opt === 'string' ? opt : opt.value) === value)
  if (!option) return value
  return typeof option === 'string' ? option : String(option.label)
}

export const Cell = ({ cellData, field }: DefaultCellComponentProps<SelectFieldClient, string>) => {
  if (!cellData) return null

  return <SkillTypeBadge label={labelFor(field.options, cellData)} value={cellData} />
}

export default Cell

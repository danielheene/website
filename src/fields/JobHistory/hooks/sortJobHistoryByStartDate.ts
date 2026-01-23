import { FieldHook } from 'payload'
import { JobHistory } from '@payload-types'

export const sortJobHistoryByStartDate: FieldHook = ({ value = [] }: { value?: JobHistory }) => {
  return value
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
    .map((data, index) => Object.assign(data, { id: index + 1 }))
}

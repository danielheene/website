import type { JSONFieldServerComponent } from 'payload'

import { cn } from '@/lib/cn'
import { generateExperienceInterval } from '@/lib/i18n'
import type { ResumeJobData } from '@/types/payload'

export const JobsList: JSONFieldServerComponent = async ({ value }) => {
  return (
    <div className={cn('flex', 'flex-col', 'gap-4')}>
      {Array.isArray(value) &&
        value.map((job: ResumeJobData) => {
          const { id, title, employer, startDate, endDate } = job
          const timeString = generateExperienceInterval({
            startDate,
            endDate,
          })

          return (
            <div
              key={id}
              className={cn('flex', 'flex-row', 'items-center', 'gap-2')}
            >
              <span className={cn('text-lg', 'font-medium')}>{title}</span>
              <span className={cn('text-lg', 'font-medium')}>
                &nbsp;@&nbsp;
              </span>
              <span className={cn('text-lg', 'font-medium')}>{employer}</span>
              <span className={cn('text-md', 'text-gray-500')}>
                [{timeString}]
              </span>
            </div>
          )
        })}
    </div>
  )
}

export default JobsList

import type { ResumeExperienceGlobalData } from '@payload-types'

import { Badge } from '@/components/Badge'
import { cn } from '@/utilities/cn'
import { useExperienceTimeSpan } from '@/utilities/useExperienceTimeSpan'

export const JobEntry = ({
  title,
  employer,
  startDate,
  endDate,
  content,
  technologies,
}: ResumeExperienceGlobalData['jobHistory'][number]) => {
  const timeString = useExperienceTimeSpan(startDate, endDate)

  return (
    <article className={cn('flex flex-col gap-4 p-4', 'lg:gap-8 lg:p-8', 'bg-white', 'text-black', 'rounded-2xl')}>
      <header className="flex row justify-between font-mono">
        <h3 className="flex flex-col">
          <span className="text-sm lg:text-lg font-medium">{employer}</span>
          <span className="text-xl lg:text-2xl font-extrabold text-primary">{title}</span>
        </h3>
        <time className="text-sm lg:text-lg font-medium uppercase whitespace-nowrap">{timeString}</time>
      </header>
      {Array.isArray(content) && content.length > 0 && (
        <ul>
          {content
            .filter(({ item }) => typeof item === 'string' && item !== '')
            .map(({ item, id }) => (
              <li key={id}>{item}</li>
            ))}
        </ul>
      )}
      {technologies.length > 0 && (
        <footer className="flex flex-wrap gap-2">
          {technologies.map(({ id, label }) => (
            <Badge key={id} color="primary">
              {label}
            </Badge>
          ))}
        </footer>
      )}
    </article>
  )
}

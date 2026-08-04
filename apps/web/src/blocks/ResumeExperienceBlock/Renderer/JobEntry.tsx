import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { cn } from '@repo/utils/cn'

import type { ReducedToLocale } from '@/lib/i18n'
import { generateExperienceInterval } from '@/lib/i18n'
import type { ResumeJobData } from '@/types/payload'

export const JobEntry = ({
  title,
  employer,
  startDate,
  endDate,
  tasks,
  // technologies,
}: ReducedToLocale<ResumeJobData>) => {
  const timeString = generateExperienceInterval({
    startDate,
    endDate,
  })

  return (
    <article
      className={cn(
        'flex flex-col gap-4 p-4',
        'lg:gap-8 lg:p-8',
        'bg-white',
        'text-black',
        'rounded-2xl',
      )}
    >
      <header className="flex row justify-between font-mono">
        <h3 className="flex flex-col">
          <span className="text-sm lg:text-lg font-medium">{employer}</span>
          <span className="text-xl lg:text-2xl font-extrabold text-primary">{title}</span>
        </h3>
        <time className="text-sm lg:text-lg font-medium uppercase whitespace-nowrap">
          {timeString}
        </time>
      </header>
      {Array.isArray(tasks) && tasks.length > 0 && (
        <ul>
          {tasks
            .filter(({ task }) => typeof task === 'string' && task !== '')
            .map(({ task, id }) => (
              <li key={id}>
                {convertLexicalToPlaintext({
                  data: task,
                })}
              </li>
            ))}
        </ul>
      )}
      {/*{technologies.length > 0 && (*/}
      {/*  <footer className="flex flex-wrap gap-2">*/}
      {/*    {technologies.map(({ id, label }) => (*/}
      {/*      <Badge key={id} color="primary">*/}
      {/*        {label}*/}
      {/*      </Badge>*/}
      {/*    ))}*/}
      {/*  </footer>*/}
      {/*)}*/}
    </article>
  )
}

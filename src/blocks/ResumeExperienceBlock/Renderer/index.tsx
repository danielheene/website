import { Badge } from '@/components/Badge'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/utilities/cn'
import { useExperienceTimeSpan } from '@/utilities/useExperienceTimeSpan'
import { GlobalSlug, ResumeLayoutBlockData } from '@custom-types'
import { JSX } from 'react'
import { SkillChart } from './SkillChart'

export const Renderer = ({
  blockType,
  data: { title, caption, jobHistory, skillSummary },
}: ResumeLayoutBlockData<GlobalSlug.ResumeExperience>): JSX.Element => (
  <SectionContainer id={blockType} title={title} variant="primary">
    <div className={cn('container', 'my-24 lg:my-48', 'grid', 'gap-4', 'grid-cols-12')}>
      <div className={cn('col-span-10 col-start-2 lg:col-span-5 lg:col-start-1 xl:col-span-4 my-24 lg:my-48')}>
        <div className={cn('text-center lg:text-left lg:sticky lg:top-12 flex flex-col gap-12')}>
          {title && <Headline variant="section">{title}</Headline>}
          {caption && <RichText data={caption} enableGutter={false} />}
          {skillSummary && (
            <SkillChart
              skillSummary={skillSummary as any /* eslint-disable-line @typescript-eslint/no-explicit-any */}
              className="mt-24 md:mt-48"
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          'col-span-12 lg:col-span-6 lg:col-start-7 xl:col-span-7 xl:col-start-6',
          'my-24 lg:my-48',
          'relative',
          'flex flex-col gap-12 lg:gap-24',
        )}
      >
        {jobHistory.map(({ id, title, employer, startDate, endDate, content, technologies }) => {
          const timeString = useExperienceTimeSpan(startDate, endDate)
          return (
            <article key={id} className={cn('flex flex-col gap-4 p-4', 'lg:gap-8 lg:p-8', 'bg-white', 'text-black', 'rounded-sm')}>
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
              {/*<RichText data={content} enableGutter={false} className="w-full" />*/}
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
        })}
      </div>
    </div>
  </SectionContainer>
)

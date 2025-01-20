import { cn } from '@/utilities/cn'
import RichText from '@/components/RichText'
import { Headline } from '@/components/Headline'
import { useExperienceTimeSpan } from '@/utilities/useExperienceTimeSpan'
import { Badge } from '@/components/Badge'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'
import { ResumeExperienceSectionSkillSummary } from '@/components/SectionRenderer/components/ResumeExperienceSection.SkillSummary'

export const ResumeExperienceSection = ({
  className,
  anchor,
  title,
  caption,
  skillSummary,
  entries = [],
}: SectionProps<'resumeExperience'>) => {
  return (
    <SectionContainer
      id={anchor}
      title={title}
      className={cn(['bg-primary text-white', className])}
    >
      <div className={cn('container', 'my-24 lg:my-48', 'grid', 'gap-4', 'grid-cols-12')}>
        <div
          className={cn(
            'col-span-10 col-start-2 lg:col-span-5 lg:col-start-1 xl:col-span-4 my-24 lg:my-48',
          )}
        >
          <div className={cn('text-center lg:text-left lg:sticky lg:top-12 flex flex-col gap-12')}>
            {title && <Headline variant="section">{title}</Headline>}
            {caption && <RichText content={caption} enableGutter={false} />}
            {skillSummary && (
              <ResumeExperienceSectionSkillSummary
                skillSummary={
                  skillSummary as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
                }
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
          {entries.map(({ id, title, employer, startDate, endDate, richText, technologies }) => {
            const timeString = useExperienceTimeSpan(startDate, endDate)
            return (
              <article
                key={id}
                className={cn(
                  'flex flex-col gap-4 p-4',
                  'lg:gap-8 lg:p-8',
                  'bg-white',
                  'text-black',
                  'rounded-2xl',
                )}
              >
                <header className="flex flex-col font-mono">
                  <time className="text-sm lg:text-lg font-medium uppercase whitespace-nowrap">
                    {timeString}
                  </time>
                  <h3 className="text-xl lg:text-2xl font-extrabold text-primary">{title}</h3>
                  <h4 className="text-sm lg:text-lg font-medium">{employer}</h4>
                </header>
                <RichText content={richText} enableGutter={false} className="w-full" />
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
}

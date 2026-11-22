'use client'

import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { Badge } from '@/components/Badge'
import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { generateExperienceInterval, ReducedToBilingualLanguage } from '@/lib/i18n'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { ResolvedRelations } from '@/lib/resolveRelation'
import { ResumeExperienceBlock, ResumeJobData, ResumeSkillTagData } from '@/types/payload'

import { SkillChart } from './SkillChart'

interface ResumeExperienceBlockClientRendererProps extends ResumeExperienceBlock, BlockAnchors {
  title: string
  jobs: ReducedToBilingualLanguage<ResolvedRelations<ResumeJobData>>[]
  skillTags: Pick<ResumeSkillTagData, 'id' | 'title' | 'slug' | 'interval'>[]
}

export const ResumeExperienceBlockClientRenderer = ({
  anchorId,
  title,
  caption,
  jobs,
  skillTags,
}: ResumeExperienceBlockClientRendererProps): JSX.Element => (
  <SectionContainer id={anchorId} title={title} variant="primary">
    <div className={cn('container', 'py-24 lg:py-48', 'grid', 'gap-4', 'grid-cols-12')}>
      <div
        className={cn(
          'col-span-10 col-start-2 my-24 lg:col-span-5 lg:col-start-1 lg:my-48 xl:col-span-4',
        )}
      >
        <Reveal className={cn('flex flex-col gap-12 text-center lg:sticky lg:top-12 lg:text-left')}>
          {title && (
            <Headline variant="section" data-reveal-item>
              {title}
            </Headline>
          )}
          {caption && (
            <RichText
              className="text-inherit"
              data={caption}
              enableGutter={false}
              data-reveal-item
            />
          )}
          {skillTags && (
            <div data-reveal-item>
              <SkillChart skillTags={skillTags} className="mt-24 md:mt-48" />
            </div>
          )}
        </Reveal>
      </div>

      <div
        className={cn(
          'col-span-12 lg:col-span-6 lg:col-start-7 xl:col-span-7 xl:col-start-6',
          'my-24 lg:my-48',
          'relative',
          'flex flex-col gap-12 lg:gap-24',
        )}
      >
        {Array.isArray(jobs) &&
          jobs.map(
            ({
              id,
              title,
              employer,
              startDate,
              endDate,
              tasks,
              skillTags,
              // technologies,
            }) => {
              const timeString = generateExperienceInterval({
                startDate,
                endDate,
              })

              return (
                <Reveal key={id}>
                  <article
                    data-reveal-item
                    className={cn(
                      'flex flex-col gap-4 p-4',
                      'lg:gap-8 lg:p-8',
                      'bg-white',
                      'text-black',
                      'rounded-sm',
                    )}
                  >
                    {/* the date range sits above the title on phones, where both won't fit side by side */}
                    <header className="flex flex-col-reverse gap-1 font-mono sm:flex-row sm:justify-between sm:gap-4">
                      <h3 className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium lg:text-lg">{employer}</span>
                        <span className="text-xl font-extrabold text-primary lg:text-2xl">
                          {title}
                        </span>
                      </h3>
                      <time className="text-sm font-medium whitespace-nowrap uppercase lg:text-lg">
                        {timeString}
                      </time>
                    </header>
                    {Array.isArray(tasks) && tasks.length > 0 && (
                      <div className="flex flex-col gap-4">
                        {tasks
                          .filter(({ task }) => !isEmptyValue(task))
                          .map(({ task, id }) => (
                            <RichText
                              key={id}
                              data={task}
                              enableGutter={false}
                              className={cn([
                                'light relative w-full pl-4 text-[1rem] leading-[1.5rem]',
                                '[&>p]:my-0 [&>p]:py-0',
                                'before:absolute before:top-[0.85rem] before:left-0 before:block before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-primary',
                              ])}
                            />
                          ))}
                      </div>
                    )}
                    {/*<RichText data={content} enableGutter={false} className="w-full" />*/}
                    {skillTags.length > 0 && (
                      <footer className="light flex flex-wrap gap-2" data-theme="light">
                        {skillTags.map(({ value: { title, id } }) => (
                          <Badge key={id} color="primary" style="solid">
                            {title}
                          </Badge>
                        ))}
                      </footer>
                    )}
                  </article>
                </Reveal>
              )
            },
          )}
      </div>
    </div>
  </SectionContainer>
)

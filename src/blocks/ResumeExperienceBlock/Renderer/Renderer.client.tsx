'use client'

import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { generateExperienceInterval, ReducedToBilingualLanguage } from '@/lib/i18n'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { ResolvedRelations } from '@/lib/resolveRelation'
import { ResumeExperienceBlock, ResumeJobData, ResumeSkillTagData } from '@/types/payload'

import { SkillChart } from './SkillChart'

interface ResumeExperienceBlockClientRendererProps extends ResumeExperienceBlock {
  title: string
  jobs: ReducedToBilingualLanguage<ResolvedRelations<ResumeJobData>>[]
  skillTags: Pick<ResumeSkillTagData, 'id' | 'title' | 'slug' | 'interval'>[]
}

export const ResumeExperienceBlockClientRenderer = ({
  title,
  caption,
  jobs,
  skillTags,
}: ResumeExperienceBlockClientRendererProps): JSX.Element => (
  <SectionContainer title={title} variant="primary">
    <div className={cn('container', 'my-24 lg:my-48', 'grid', 'gap-4', 'grid-cols-12')}>
      <div
        className={cn(
          'col-span-10 col-start-2 lg:col-span-5 lg:col-start-1 xl:col-span-4 my-24 lg:my-48',
        )}
      >
        <Reveal className={cn('text-center lg:text-left lg:sticky lg:top-12 flex flex-col gap-12')}>
          {title && (
            <Headline variant="section" data-reveal-item>
              {title}
            </Headline>
          )}
          {caption && (
            <div data-reveal-item>
              <RichText className="text-inherit" data={caption} enableGutter={false} />
            </div>
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
                    <header className="flex row justify-between font-mono">
                      <h3 className="flex flex-col">
                        <span className="text-sm lg:text-lg font-medium">{employer}</span>
                        <span className="text-xl lg:text-2xl font-extrabold text-primary">
                          {title}
                        </span>
                      </h3>
                      <time className="text-sm lg:text-lg font-medium uppercase whitespace-nowrap">
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
                                'w-full pl-4 light relative',
                                '[&>p]:py-0 [&>p]:my-0',
                                'before:block before:w-2 before:h-2 before:rounded-full before:absolute before:left-0 before:top-[0.65rem] before:bg-primary',
                              ])}
                            />
                          ))}
                      </div>
                    )}
                    {/*<RichText data={content} enableGutter={false} className="w-full" />*/}
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
                </Reveal>
              )
            },
          )}
      </div>
    </div>
  </SectionContainer>
)

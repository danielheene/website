'use client'

import type { JSX } from 'react'

import { Reveal } from '@website/app-components/Reveal/index'
import { SectionContainer } from '@website/app-components/SectionContainer/index'
import { Headline } from '@website/components/Headline'
import { generateExperienceInterval, ReducedToBilingualLanguage } from '@website/lib/i18n'
import { isEmptyValue } from '@website/lib/lexical/isEmptyValue'
import { ResumeExperienceBlock, ResumeJobData, ResumeSkillTagData } from '@website/types/payload'
import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import { ResolvedRelations } from '@/lib/resolveRelation'

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
                    <header className="row flex justify-between font-mono">
                      <h3 className="flex flex-col">
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
                                'light relative w-full pl-4',
                                '[&>p]:my-0 [&>p]:py-0',
                                'before:absolute before:top-[0.65rem] before:left-0 before:block before:size-2 before:rounded-full before:bg-primary',
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

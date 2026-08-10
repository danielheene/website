'use client'

import type { JSX } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/lib/cn'
import { generateExperienceInterval, ReducedToLocale } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'
import { ResumeExperienceBlock, ResumeJobData, ResumeSkillTagData } from '@/types/payload'

import { SkillChart } from './SkillChart'

interface ResumeExperienceBlockClientRendererProps extends ResumeExperienceBlock {
  title: string
  jobs: ReducedToLocale<ResolvedRelations<ResumeJobData>>[]
  skillTags: Pick<ResumeSkillTagData, 'id' | 'title' | 'slug' | 'interval'>[]
}

export const ResumeExperienceBlockClientRenderer = ({
  blockType,
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
        <div className={cn('text-center lg:text-left lg:sticky lg:top-12 flex flex-col gap-12')}>
          {title && <Headline variant="section">{title}</Headline>}
          {caption && <RichText className="text-inherit" data={caption} enableGutter={false} />}
          {skillTags && <SkillChart skillTags={skillTags} className="mt-24 md:mt-48" />}
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
                <article
                  key={id}
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
                    <ul>
                      {tasks
                        .filter(({ task }) => typeof task === 'string' && task !== '')
                        .map(({ task, id }) => (
                          <li key={id}>
                            <RichText data={task} enableGutter={false} className="w-full" />
                          </li>
                        ))}
                    </ul>
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
              )
            },
          )}
      </div>
    </div>
  </SectionContainer>
)

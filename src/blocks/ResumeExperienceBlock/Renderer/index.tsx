import type { GlobalSlug, ResumeLayoutBlockData } from '@custom-types'
import type { JSX } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/utilities/cn'

import { JobEntry } from './JobEntry'
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
          {skillSummary && <SkillChart skillSummary={skillSummary} className="mt-24 md:mt-48" />}
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
        {jobHistory.map((entry) => (
          <JobEntry key={entry.id} {...entry} />
        ))}
      </div>
    </div>
  </SectionContainer>
)

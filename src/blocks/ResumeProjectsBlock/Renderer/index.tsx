import type { JSX } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/lib/cn'
import type { ResumeLayoutBlockData } from '@/types/blocks'
import type { GlobalSlug } from '@/types/globals'

import { Entry } from './Entry'

export const ResumeProjectsBlockRenderer = ({
  id,
  blockType,
  data: { title, caption, projectList },
}: ResumeLayoutBlockData<GlobalSlug.ResumeProjects>): JSX.Element => (
  <SectionContainer id={id || blockType} title={title} variant="default">
    <div className={cn('container', 'py-32', 'flex', 'flex-col', 'gap-32')}>
      <header className={cn('text-center', 'mb-14', 'flex flex-col gap-24')}>
        {title && <Headline variant="section">{title}</Headline>}
        {caption && <RichText data={caption} enableGutter={false} />}
      </header>

      {projectList.map((entry, index) => {
        return <Entry key={entry.id || index} index={index} {...entry} />
      })}
    </div>
  </SectionContainer>
)

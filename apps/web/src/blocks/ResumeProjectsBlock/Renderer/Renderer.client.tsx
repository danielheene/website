'use client'

import type { JSX } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/lib/cn'
import { CollectionData, CollectionSlug } from '@/types/collections'
import { ResumeProjectsBlock } from '@/types/payload'

import { Entry } from './Entry'

interface ResumeProjectsBlockClientRendererProps extends ResumeProjectsBlock {
  title: string
  projects: CollectionData<CollectionSlug['ResumeProjects']>[]
}

export const ResumeProjectsBlockClientRenderer = ({
  blockType,
  caption,
  title,
  projects,
}: ResumeProjectsBlockClientRendererProps): JSX.Element => (
  <SectionContainer id={blockType} title={title} variant="default">
    <div className={cn('container', 'py-32', 'flex', 'flex-col', 'gap-32')}>
      <header className={cn('text-center', 'mb-14', 'flex flex-col gap-24')}>
        {title && <Headline variant="section">{title}</Headline>}
        {caption && <RichText data={caption} enableGutter={false} />}
      </header>

      {projects.map((entry, index) => {
        return <Entry key={index} index={index} {...entry} />
      })}
    </div>
  </SectionContainer>
)

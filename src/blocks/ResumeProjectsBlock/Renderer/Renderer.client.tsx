'use client'

import type { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
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
  <SectionContainer title={title} variant="default">
    <div className={cn('container', 'py-32', 'flex', 'flex-col', 'gap-32')}>
      <Reveal className={cn('text-center', 'mb-14', 'flex flex-col gap-24')}>
        {title && (
          <Headline variant="section" data-reveal-item>
            {title}
          </Headline>
        )}
        {caption && (
          <div data-reveal-item>
            <RichText data={caption} enableGutter={false} />
          </div>
        )}
      </Reveal>

      {/* Each project reveals on its own: the list is taller than a screen. */}
      {projects.map((entry, index) => (
        <Reveal key={index}>
          <div data-reveal-item>
            <Entry index={index} {...entry} />
          </div>
        </Reveal>
      ))}
    </div>
  </SectionContainer>
)

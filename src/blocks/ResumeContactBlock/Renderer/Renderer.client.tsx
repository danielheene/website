'use client'

import { cn } from 'tailwind-variants'

import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { ResumeContactBlock } from '@/types/payload'

import { ContactForm } from './ContactForm.client'

interface ResumeContactBlockClientRendererProps extends ResumeContactBlock {
  title: string
}

export const ResumeContactBlockClientRenderer = ({
  blockType,
  title,
  caption,
}: ResumeContactBlockClientRendererProps) => (
  <SectionContainer title={title} variant="default">
    <Reveal className={cn('container grid grid-cols-12 py-32', 'text-center')}>
      {title && (
        <div className="col-span-12 md:col-start-3 md:col-span-8" data-reveal-item>
          <Headline variant="section">{title}</Headline>
        </div>
      )}
      {caption && (
        <div className="col-span-12 md:col-start-2 md:col-span-10  my-8 text-xl" data-reveal-item>
          <RichText data={caption} enableGutter={false} className="text-lg" />
        </div>
      )}
      <div className="col-span-12 md:col-start-3 md:col-span-8" data-reveal-item>
        <ContactForm />
      </div>
    </Reveal>
  </SectionContainer>
)

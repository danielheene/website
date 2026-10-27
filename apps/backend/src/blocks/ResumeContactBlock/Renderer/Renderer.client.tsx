'use client'

import { Reveal } from '@website/app-components/Reveal/index'
import { SectionContainer } from '@website/app-components/SectionContainer/index'
import { Headline } from '@website/components/Headline'
import { ResumeContactBlock } from '@website/types/payload'
import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'

import { ContactForm } from './ContactForm.client'

interface ResumeContactBlockClientRendererProps extends ResumeContactBlock {
  title: string
}

export const ResumeContactBlockClientRenderer = ({
  blockType: _blockType,
  title,
  caption,
}: ResumeContactBlockClientRendererProps) => (
  <SectionContainer title={title} variant="default">
    <Reveal className={cn('container grid grid-cols-12 py-32', 'text-center')}>
      {title && (
        <div className="col-span-12 md:col-span-8 md:col-start-3" data-reveal-item>
          <Headline variant="section">{title}</Headline>
        </div>
      )}
      {caption && (
        <div className="col-span-12 my-8 text-xl md:col-span-10 md:col-start-2" data-reveal-item>
          <RichText data={caption} enableGutter={false} className="text-lg" />
        </div>
      )}
      <div className="col-span-12 md:col-span-8 md:col-start-3" data-reveal-item>
        <ContactForm />
      </div>
    </Reveal>
  </SectionContainer>
)

'use client'

import { ImageMedia } from '@website/app-components/ImageMedia/index'
import { Reveal } from '@website/app-components/Reveal/index'
import { SectionContainer } from '@website/app-components/SectionContainer/index'
import { Headline } from '@website/components/Headline'
import { ResumeAboutMeBlock } from '@website/types/payload'
import { cn } from 'tailwind-variants'

import RichText from '@/components/RichText'
import { ResolvedRelations } from '@/lib/resolveRelation'

interface ResumeAboutMeBlockClientRendererProps extends ResumeAboutMeBlock {
  title: string
  portrait: ResolvedRelations<ResumeAboutMeBlock['portrait']>
}

export const ResumeAboutMeBlockClientRenderer = ({
  blockType: _blockType,
  caption,
  portrait,
  title,
}: ResumeAboutMeBlockClientRendererProps) => (
  <SectionContainer title={title} variant="default">
    <div className="container grid min-h-screen grid-cols-12">
      <Reveal className="order-2 col-span-10 col-start-2 lg:order-1 lg:col-span-5 lg:col-start-1">
        {portrait && (
          <div data-reveal-item>
            <ImageMedia
              url={portrait.value.url}
              alt={portrait.value.alt}
              height={portrait.value.height}
              width={portrait.value.width}
              className="mt-20 -mb-20 h-auto w-full object-bottom md:mt-32 md:-mb-32 lg:mt-40 lg:-mb-40"
              // imgClassName="object-bottom"
              sizes="50vw"
            />
          </div>
        )}
      </Reveal>
      <Reveal
        className={cn(
          'col-span-10 col-start-2 mb-32 lg:col-span-5 lg:col-start-7 lg:py-32',
          'lg:sticky lg:top-0',
          'flex flex-col gap-12',
        )}
      >
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
      </Reveal>
    </div>
  </SectionContainer>
)

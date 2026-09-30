'use client'

import { cn } from 'tailwind-variants'

import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { ResolvedRelations } from '@/lib/resolveRelation'
import { ResumeAboutMeBlock } from '@/types/payload'

interface ResumeAboutMeBlockClientRendererProps extends ResumeAboutMeBlock {
  title: string
  portrait: ResolvedRelations<ResumeAboutMeBlock['portrait']>
}

export const ResumeAboutMeBlockClientRenderer = ({
  blockType,
  caption,
  portrait,
  title,
}: ResumeAboutMeBlockClientRendererProps) => (
  <SectionContainer title={title} variant="default">
    <div className="container grid grid-cols-12 min-h-screen">
      <Reveal className="col-span-10 col-start-2 lg:col-span-5 lg:col-start-1  order-2 lg:order-1">
        {portrait && (
          <div data-reveal-item>
            <ImageMedia
              url={portrait.value.url}
              alt={portrait.value.alt}
              height={portrait.value.height}
              width={portrait.value.width}
              className="w-full h-auto mt-20 md:mt-32 lg:mt-40 -mb-20 md:-mb-32 lg:-mb-40 object-bottom"
              // imgClassName="object-bottom"
              sizes="50vw"
            />
          </div>
        )}
      </Reveal>
      <Reveal
        className={cn(
          'col-span-10 col-start-2 lg:col-span-5 lg:col-start-7 mb-32 lg:py-32',
          'lg:sticky lg:top-0',
          'flex flex-col gap-12  ',
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

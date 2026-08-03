'use client'

import { Headline } from '@repo/ui/Headline'
import { LogoCarousel, LogoCarouselProps } from '@/components/LogoCarousel/LogoCarousel'
import RichText from '@/components/RichText'
import { SectionContainer } from '@repo/ui/SectionContainer'
import { ResumeCustomersBlock } from '@/types/payload'

interface ResumeCustomersBlockClientRendererProps extends ResumeCustomersBlock {
  title: string
  logos: LogoCarouselProps['entries']
}

export const ResumeCustomersBlockClientRenderer = ({
  blockType,
  title,
  caption,
  logos,
}: ResumeCustomersBlockClientRendererProps) => {
  return (
    <SectionContainer id={blockType} title={title} variant="primary">
      <div className="container py-16 lg:py-32">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-12 lg:col-span-4 lg:col-start-2 flex flex-col justify-center gap-12 mb-16 lg:mb-0">
            {title && <Headline variant="section">{title}</Headline>}
            {caption && <RichText className="text-inherit" data={caption} enableGutter={false} />}
          </div>
          <LogoCarousel className="col-span-12 lg:col-span-6" entries={logos} />
        </div>
      </div>
    </SectionContainer>
  )
}

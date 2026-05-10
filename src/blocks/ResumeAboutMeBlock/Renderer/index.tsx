import { Headline } from '@/components/Headline'
import { ImageMedia } from '@/components/ImageMedia'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { cn } from '@/lib/cn'
import type { ResumeLayoutBlockData } from '@/types/blocks'
import type { GlobalSlug } from '@/types/globals'

export const ResumeAboutMeBlockRenderer = ({
  blockType,
  data: { title, content, portrait },
}: ResumeLayoutBlockData<GlobalSlug.ResumeAboutMe>) => {
  return (
    <SectionContainer id={blockType} title={title} variant="default">
      <div className="container grid grid-cols-12 min-h-screen">
        <div className="col-span-10 col-start-2 lg:col-span-5 lg:col-start-1  order-2 lg:order-1">
          {portrait && typeof portrait === 'object' && (
            <ImageMedia
              url={portrait.url}
              alt={portrait.alt}
              height={portrait.height}
              width={portrait.width}
              className="w-full h-auto mt-20 md:mt-32 lg:mt-40 -mb-20 md:-mb-32 lg:-mb-40 object-bottom"
              // imgClassName="object-bottom"
              sizes="50vw"
            />
          )}
        </div>
        <div
          className={cn(
            'col-span-10 col-start-2 lg:col-span-5 lg:col-start-7 mb-32 lg:py-32',
            'lg:sticky lg:top-0',
            'flex flex-col gap-12  ',
          )}
        >
          {title && <Headline variant="section">{title}</Headline>}
          {content && <RichText data={content} enableGutter={false} />}
        </div>
      </div>
    </SectionContainer>
  )
}

import { Media } from '@payload-types'
import { cn } from '@/utilities/cn'
import { ImageMedia } from '@/components/ImageMedia'
import RichText from '@/components/RichText'
import { Headline } from '@/components/Headline'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'

export const ResumeAboutMeSection = ({
  className,
  anchor,
  title,
  content,
  portrait: portraitMedia,
}: SectionProps<'resumeAboutMe'>) => {
  const portrait = portraitMedia as Media

  return (
    <SectionContainer id={anchor} title={title} className={cn(['pt-32 bg-white', className])}>
      <div className="container grid grid-cols-12 ">
        <div className="col-span-10 col-start-2 lg:col-span-5 lg:col-start-1 overflow-hidden order-2 lg:order-1">
          {portrait && (
            <ImageMedia
              url={portrait.url}
              alt={portrait.alt}
              height={portrait.height}
              width={portrait.width}
              duoTone
              className="w-full h-auto -mb-2 mix-blend-darken"
            />
          )}
        </div>
        <div
          className={cn(
            'col-span-10 col-start-2 lg:col-span-5 lg:col-start-7 mb-32 lg:py-32',
            'lg:sticky lg:top-40',
            'flex flex-col gap-12  ',
          )}
        >
          {title && <Headline variant="section">{title}</Headline>}
          {content && <RichText content={content} enableGutter={false} />}
        </div>
      </div>
    </SectionContainer>
  )
}

import { Media } from '@payload-types'
import { cn } from '@/utilities/cn'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionProps } from '@/custom-types'
import { ResumeProjectsSectionImage } from './ResumeProjectsSection.Image'
import { memo } from 'react'

type ResumeProjectsSectionEntryProps = SectionProps<'resumeProjects'>['entries'][number] & {
  index: number
}

export const ResumeProjectsSectionEntry = memo(function ResumeProjectsSectionEntry({
  headline,
  richText,
  subline,
  image: imageMedia,
  index,
}: ResumeProjectsSectionEntryProps) {
  const image = imageMedia as Media

  return (
    <article className={cn(['grid grid-cols-12 gap-4'])}>
      <div
        className={cn([
          'col-span-12 md:col-span-7 lg:col-span-6 flex flex-col',
          index % 2 ? 'md:order-2 md:col-start-6 lg:col-start-7' : 'md:order-1',
        ])}
      >
        {headline && (
          <Headline variant="section" className="text-3xl text-primary line-height-1 order-2">
            {headline}
          </Headline>
        )}
        {subline && (
          <Headline as="h3" variant="section" className="text-xl order-1">
            {subline}
          </Headline>
        )}
        {richText && <RichText content={richText} enableGutter={false} className="mt-16 order-3" />}
      </div>
      {image && <ResumeProjectsSectionImage image={image} odd={!!(index % 2)} />}
    </article>
  )
})

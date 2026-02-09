import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/cn'
import { MediaImage, ProjectList } from '@payload-types'
import { memo } from 'react'
import { Image } from './Image'

type ResumeProjectsSectionEntryProps = ProjectList[number] & {
  index: number
}

export const Entry = memo(function ResumeProjectsSectionEntry({
  preHeading,
  heading,
  content,
  image: imageMedia,
  index,
}: ResumeProjectsSectionEntryProps) {
  const image = imageMedia as MediaImage

  return (
    <article className={cn(['grid grid-cols-12 gap-4'])}>
      <div
        className={cn([
          'col-span-12 md:col-span-7 lg:col-span-6 flex flex-col',
          index % 2 ? 'md:order-2 md:col-start-6 lg:col-start-7' : 'md:order-1',
        ])}
      >
        {preHeading && (
          <Headline as="h3" variant="section" className="text-xl">
            {preHeading}
          </Headline>
        )}
        {heading && (
          <Headline variant="section" className="text-3xl text-primary line-height-1">
            {heading}
          </Headline>
        )}
        {content && <RichText data={content} enableGutter={false} className="mt-16 order-3" />}
      </div>
      {image && <Image image={image} odd={!!(index % 2)} />}
    </article>
  )
})

import type { MediaImage, ProjectList } from '@/types/payload'
import { memo } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { cn } from '@/lib/cn'

import { Image } from './Image'
import { ReducedToLocale } from '@/lib/i18n'
import { ResolvedRelations } from '@/lib/resolveRelation'

interface ResumeProjectsSectionEntryProps extends ReducedToLocale<ResolvedRelations<ProjectList[number]>>     {
  index: number
}

export const Entry = memo(function ResumeProjectsSectionEntry({
  preHeading,
  heading,
  content,
  image,
  index,
}: ResumeProjectsSectionEntryProps) {

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
      {image && <Image image={image.value} odd={!!(index % 2)} />}
    </article>
  )
})

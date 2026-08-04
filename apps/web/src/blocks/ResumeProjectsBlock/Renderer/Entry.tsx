import { memo } from 'react'

import { Headline } from '@repo/ui/Headline'
import { cn } from '@repo/utils/cn'

import RichText from '@/components/RichText'
import { CollectionData, CollectionSlug } from '@/types/collections'

import { Image } from './Image'

interface ResumeProjectsSectionEntryProps extends CollectionData<CollectionSlug['ResumeProjects']> {
  index: number
}

export const Entry = memo(function ResumeProjectsSectionEntry({
  index,
  title,
  description,
  images,
  scope,
}: ResumeProjectsSectionEntryProps) {
  return (
    <article
      className={cn([
        'grid grid-cols-12 gap-4',
      ])}
    >
      <div
        className={cn([
          'col-span-12 md:col-span-7 lg:col-span-6 flex flex-col',
          index % 2 ? 'md:order-2 md:col-start-6 lg:col-start-7' : 'md:order-1',
        ])}
      >
        {scope && (
          <Headline as="h3" variant="section" className="text-xl">
            {scope}
          </Headline>
        )}
        {title && (
          <Headline variant="section" className="text-3xl text-primary line-height-1">
            {title}
          </Headline>
        )}
        {description && (
          <RichText data={description} enableGutter={false} className="mt-16 order-3" />
        )}
      </div>
      {images && <Image image={images[0].value} odd={!!(index % 2)} />}
    </article>
  )
})

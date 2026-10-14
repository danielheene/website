import { memo } from 'react'

import { cn } from 'tailwind-variants'

import { Headline } from '@/components/Headline'
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
    <article className={cn(['grid grid-cols-12 gap-4'])}>
      <div
        className={cn([
          'col-span-12 flex flex-col md:col-span-7 lg:col-span-6',
          index % 2 ? 'md:order-2 md:col-start-6 lg:col-start-7' : 'md:order-1',
        ])}
      >
        {scope && (
          <Headline as="h3" variant="section" className="text-xl">
            {scope}
          </Headline>
        )}
        {title && (
          <Headline variant="section" className="line-height-1 text-3xl text-primary">
            {title}
          </Headline>
        )}
        {description && (
          <RichText data={description} enableGutter={false} className="order-3 mt-16" />
        )}
      </div>
      {images?.[0]?.value && <Image image={images[0].value} odd={!!(index % 2)} />}
    </article>
  )
})

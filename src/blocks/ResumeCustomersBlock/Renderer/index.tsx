'use client'

import { isNull, isString } from 'lodash-es'
import { type JSX, useMemo } from 'react'
import type { SetNonNullable } from 'type-fest'

import { Headline } from '@/components/Headline'
import { LogoCarousel } from '@/components/LogoCarousel'
import type { LogoCarouselProps } from '@/components/LogoCarousel/LogoCarousel'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import type { ResumeLayoutBlockData } from '@/types/blocks'
import type { GlobalSlug } from '@/types/globals'
import type { CustomerLogos } from '@/types/payload'

export const ResumeCustomersBlockRenderer = ({
  id,
  blockType,
  data: { title, caption, customerLogos },
}: ResumeLayoutBlockData<GlobalSlug.ResumeCustomers>): JSX.Element => {
  const filteredEntries: LogoCarouselProps['entries'] = useMemo(
    () =>
      customerLogos.filter(
        (item): item is SetNonNullable<Required<CustomerLogos[number]>> =>
          isString(item.id) &&
          !isNull(item.id) &&
          isString(item.logo) &&
          !isNull(item.logo) &&
          isString(item.name) &&
          !isNull(item.name),
      ),
    [
      customerLogos,
    ],
  )

  return (
    <SectionContainer id={id || blockType} title={title} variant="primary">
      <div className="container py-16 lg:py-32">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-12 lg:col-span-4 lg:col-start-2 items-center mb-16 lg:mb-0">
            {title && <Headline variant="section">{title}</Headline>}
            {caption && (
              <RichText
                className="mt-12 text-lg leading-8"
                data={caption}
                enableGutter={false}
              />
            )}
          </div>
          <LogoCarousel
            className="col-span-12 lg:col-span-6"
            entries={filteredEntries}
          />
        </div>
      </div>
    </SectionContainer>
  )
}

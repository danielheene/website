'use client'

import { ResumeCustomer } from '@payload-types'
import { JSX, useMemo } from 'react'
import { cn } from '@/utilities/cn'
import RichText from '../../RichText'
import { LogoCarousel } from '@/components/LogoCarousel'
import { isNull, isString } from 'lodash-es'
import { SetNonNullable } from 'type-fest'
import { Headline } from '@/components/Headline'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'

export const ResumeCustomersSection = ({
  className,
  anchor,
  title,
  caption,
  entries = [],
}: SectionProps<'resumeCustomers'>): JSX.Element => {
  const filteredEntries = useMemo(
    () =>
      entries.filter(
        // eslint-disable-next-line
        (item: any): item is SetNonNullable<Required<ResumeCustomer['entries'][number]>> =>
          isString(item.id) &&
          !isNull(item.id) &&
          isString(item.logo) &&
          !isNull(item.logo) &&
          isString(item.title) &&
          !isNull(item.title),
      ),
    [entries],
  )

  return (
    <SectionContainer
      id={anchor}
      title={title}
      className={cn(['text-white', 'bg-primary', className])}
    >
      <div className="container py-16 lg:py-32">
        <div className="grid grid-cols-12 items-center gap-8">
          <div className="col-span-12 lg:col-span-6 items-center mb-16 lg:mb-0">
            {title && <Headline variant="section">{title}</Headline>}
            {caption && (
              <RichText
                className="mt-12 text-lg leading-8"
                content={caption}
                enableGutter={false}
              />
            )}
          </div>
          <LogoCarousel className="col-span-12 lg:col-span-6" entries={filteredEntries} />
        </div>
      </div>
    </SectionContainer>
  )
}

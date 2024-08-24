  'use client'

import { Page } from '@payload-types'
import { JSX, useMemo } from 'react'
import { cn } from '@/utilities/cn'
import RichText from '@/components/RichText'
import { LogoCarousel } from './components/LogoCarousel'
import { isLogoCloudEntry, LogoCloudEntry } from './LogoCloud.shared'

type LogoCloudProps = Required<Extract<Page['layout'][0], { blockType: 'logoCloudBlock' }>> & {
  className?: string
}

export const LogoCloud = ({
  id,
  title,
  caption,
  entries = [],
  className,
}: LogoCloudProps): JSX.Element => {
  const chunks = useMemo(
    (): [LogoCloudEntry, LogoCloudEntry][] =>
      entries
        .filter(isLogoCloudEntry)
        .reduce((previousValue, currentValue, index) => {
          const rowIndex = Math.floor(index / 2)
          const tileIndex = index % 2

          previousValue[rowIndex] = previousValue[rowIndex] || []
          previousValue[rowIndex][tileIndex] = currentValue
          return previousValue
        }, [])
        .filter((row) => row.length === 2),
    [entries],
  )

  return (
    <section key={id} className={cn(['bg-secondary', className])}>
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-12">
          <div className="mx-auto w-full lg:col-span-6 max-w-xl lg:mx-0">
            <h2 className="text-4xl text-primary font-supply-mono">{title}</h2>
            <RichText className="mt-12 text-lg leading-8" content={caption} enableGutter={false} />
          </div>
          <LogoCarousel chunks={chunks} />
        </div>
      </div>
    </section>
  )
}

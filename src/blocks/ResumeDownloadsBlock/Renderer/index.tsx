'use client'

import type { GlobalSlug, ResumeLayoutBlockData } from '@custom-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

import { Button } from '@/components/Button'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { isMediaImage } from '@/lib/typeGuards'
import { cn } from '@/utilities/cn'

export const Renderer = ({
  blockType,
  data: { title, caption, documentPreview },
}: ResumeLayoutBlockData<GlobalSlug.ResumeDownloads>): JSX.Element => {
  return (
    <SectionContainer id={blockType} title={title} variant="default">
      <div className="relative container flex flex-col p-20 md:flex-row overflow-hidden bg-primary text-primary-foreground">
        <div className="mb-[18rem] md:mb-28 md:w-2/3 lg:shrink-0 xl:mb-20 xl:w-1/2">
          <Headline variant="section">{title}</Headline>
          <RichText data={caption} enableGutter={false} className="text-primary-foreground" />

          <Button type="button" variant="secondary" className="uppercase" asChild>
            <Link href="/download/resume.pdf?locale=en" download="Resume_EN">
              Download Resume [EN]
            </Link>
          </Button>
          <Button type="button" variant="secondary" className="uppercase" asChild>
            <Link href="/download/resume.pdf?locale=de" download="Resume_DE">
              Download Resume [DE]
            </Link>
          </Button>
        </div>
        <div className="absolute right-1/2 bottom-0 mr-6 h-min w-[110%] max-w-md translate-x-1/2 md:-right-36 md:mr-0 md:w-3/4 md:max-w-xl md:translate-x-0 lg:mt-auto xl:relative xl:right-0 xl:h-full xl:w-full xl:max-w-full">
          <div className="relative aspect-8/5 h-full min-h-[16rem] w-full">
            {isMediaImage(documentPreview) && (
              <>
                <Image
                  style={{
                    aspectRatio: `${documentPreview.width} / ${documentPreview.height}`,
                  }}
                  className={cn([
                    'absolute top-0 right-0 z-40 flex w-3/5',
                    '-translate-x-[24%] md:max-xl:-translate-x-[8%] translate-y-[24%] md:max-xl:translate-y-[16%] -rotate-30',
                    'justify-center overflow-clip rounded-sm bg-background shadow-lg shadow-foreground/20 ',
                  ])}
                  src={documentPreview.url}
                  blurDataURL={documentPreview.blurDataURL}
                  alt={documentPreview.alt}
                  width={documentPreview.width}
                  height={documentPreview.height}
                />
                <Image
                  style={{
                    aspectRatio: `${documentPreview.width} / ${documentPreview.height}`,
                  }}
                  className={cn([
                    'absolute top-0 right-0 z-40 flex w-3/5',
                    '-translate-x-[16%] md:max-xl:-translate-x-[6%] translate-y-[8%] md:max-xl:translate-y-[6%] -rotate-15',
                    'justify-center overflow-clip rounded-sm bg-background shadow-xl shadow-foreground/20  ',
                  ])}
                  src={documentPreview.url}
                  blurDataURL={documentPreview.blurDataURL}
                  alt={documentPreview.alt}
                  width={documentPreview.width}
                  height={documentPreview.height}
                />
                <Image
                  style={{
                    aspectRatio: `${documentPreview.width} / ${documentPreview.height}`,
                  }}
                  className={cn([
                    'absolute top-0 right-0 z-40 flex w-3/5',
                    'items-center justify-center overflow-clip rounded-sm bg-background shadow-2xl shadow-foreground/20',
                  ])}
                  src={documentPreview.url}
                  blurDataURL={documentPreview.blurDataURL}
                  alt={documentPreview.alt}
                  width={documentPreview.width}
                  height={documentPreview.height}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}

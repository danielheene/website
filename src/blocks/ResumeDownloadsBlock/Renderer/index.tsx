'use client'

import type { GlobalSlug, ResumeLayoutBlockData } from '@custom-types'
import Image from 'next/image'
import Link from 'next/link'
import type { JSX } from 'react'

import { Button } from '@/components/Button'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { isMediaDocument, isMediaImage } from '@/lib/typeGuards'
import { cn } from '@/utilities/cn'

export const ResumeDownloadsBlockRenderer = ({
  blockType,
  data: { title, caption, documentPreview, documents },
}: ResumeLayoutBlockData<GlobalSlug.ResumeDownloads>): JSX.Element => {
  return (
    <SectionContainer id={blockType} title={title} variant="default">
      <div className="container">
        <div className="relative flex flex-col p-6 md:p-12 lg:p-20 md:flex-row overflow-hidden bg-primary text-primary-foreground rounded-md">
          <div className="flex flex-col justify-center items-center mb-72 md:mb-0 gap-8 md:w-2/3 lg:shrink-0 xl:w-1/2">
            <Headline variant="section">{title}</Headline>
            <RichText data={caption} enableGutter={false} className="text-primary-foreground px-8" />

            <div className="flex flex-col md:flex-row justify-center gap-8 text-background-foreground">
              {isMediaDocument(documents.en) && (
                <ResumeDownloadButton
                  locale="en"
                  url={documents.en.url}
                  fileName={documents.en.filename}
                  label="Download"
                  subline="English Version"
                />
              )}
              {isMediaDocument(documents.de) && (
                <ResumeDownloadButton
                  locale="de"
                  url={documents.de.url}
                  fileName={documents.de.filename}
                  label="Download"
                  subline="German Version"
                />
              )}
            </div>
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
      </div>
    </SectionContainer>
  )
}

function ResumeDownloadButton({
  url,
  fileName,
  locale,
  label,
  subline,
}: {
  url: string
  fileName: string
  locale: string
  label: string
  subline: string
}) {
  return (
    <Button type="button" variant="secondary" className="uppercase" asChild>
      <Link href={url} download={fileName}>
        <div className="flex items-center gap-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-foreground/80 dark:text-background/80" viewBox="0 0 124 124">
            {locale === 'en' && (
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M121 68v50h-8L98 84v34h-8V68h8l15 34V68Zm-39 8H59v13h20v7H59v14h23v8H51V68h31Z"
              />
            )}
            {locale === 'de' && (
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M121 76H98v13h20v7H98v14h23v8H90V68h31Zm-52.8-8q3.69 0 6.84 1.9a14 14 0 0 1 4.99 5.06A14 14 0 0 1 82 82v22c0 2.52-.74 4.86-1.97 7a14 14 0 0 1-5 5.1 13 13 0 0 1-6.84 1.9H51V68zm-.2 42c1.26 0 3.12-1.1 4-2s2-3.76 2-5V83c0-1.29-.97-3.14-1.83-4.02C71.31 78.09 69.3 76 68 76h-9v34Z"
              />
            )}
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="m80.83 35.17-28-28A4 4 0 0 0 50 6H10a8 8 0 0 0-8 8v96a8 8 0 0 0 8 8h32v-8H10V14h32v24a8 8 0 0 0 8 8h24v16h8V38a4 4 0 0 0-1.17-2.83M50 15.66 72.34 38H50Z"
            />
          </svg>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl leading-none font-medium tracking-tighter">{label}</span>
            <span className="text-xs leading-none  text-foreground/80 dark:text-background/80">{subline}</span>
          </div>
        </div>
      </Link>
    </Button>
  )
}

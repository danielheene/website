'use client'

import { JSX } from 'react'

import { Headline } from '@repo/ui/Headline'
import { SectionContainer } from '@repo/ui/SectionContainer'
import { cn } from 'tailwind-variants'

import { ResumePreviewImage } from '@/blocks/ResumeDownloadsBlock/Renderer/ResumePreviewImage'
import RichText from '@/components/RichText'
import { MediaDocument, MediaImage, ResumeDownloadsBlock } from '@/types/payload'

import { ResumeDownloadButton } from './ResumeDownloadButton'

interface ResumeDownloadsBlockClientRendererProps extends ResumeDownloadsBlock {
  title: string
  document_en: MediaDocument
  document_de: MediaDocument
  thumbnails_en: MediaImage[]
  thumbnails_de: MediaImage[]
}

export const ResumeDownloadsBlockClientRenderer = ({
  title,
  caption,
  blockType,
  document_en,
  document_de,
  thumbnails_en,
  thumbnails_de,
}: ResumeDownloadsBlockClientRendererProps): JSX.Element => (
  <SectionContainer id={blockType} title={title} variant="default">
    <div className="container">
      <div className="relative flex flex-col p-6 md:p-12 lg:p-20 md:flex-row overflow-hidden bg-primary text-primary-foreground rounded-md">
        <div className="flex flex-col justify-center items-center mb-72 md:mb-0 gap-8 md:w-2/3 lg:shrink-0 xl:w-1/2">
          <Headline variant="section">{title}</Headline>
          <RichText data={caption} enableGutter={false} className="text-primary-foreground px-8" />

          <div className="flex flex-col md:flex-row justify-center gap-8 text-background-foreground">
            {document_en && (
              <ResumeDownloadButton
                locale="en"
                url={document_en.url}
                fileName={document_en.filename}
                label="Download"
                subline="English Version"
              />
            )}
            {document_de && (
              <ResumeDownloadButton
                locale="de"
                url={document_de.url}
                fileName={document_de.filename}
                label="Download"
                subline="German Version"
              />
            )}
          </div>
        </div>
        <div className="absolute right-1/2 bottom-0 mr-6 h-min w-[110%] max-w-md translate-x-1/2 md:-right-36 md:mr-0 md:w-3/4 md:max-w-xl md:translate-x-0 lg:mt-auto xl:relative xl:right-0 xl:h-full xl:w-full xl:max-w-full">
          <div className="relative aspect-8/5 h-full min-h-[16rem] w-full">
            {thumbnails_en.reverse().map(
              (thumbnail, index) =>
                index <= 3 && (
                  <ResumePreviewImage
                    {...thumbnail}
                    key={thumbnail.id}
                    className={cn([
                      index === 0 &&
                        'translate-x-[-24%] md:max-xl:translate-x-[-8%] translate-y-[24%] md:max-xl:translate-y-[16%] -rotate-30',
                      index === 1 &&
                        'translate-x-[-12%] md:max-xl:translate-x-[-4%] translate-y-[12%] md:max-xl:translate-y-[8%] -rotate-15',
                      index === 2 &&
                        'translate-x-[-6%] md:max-xl:translate-x-[-2%] translate-y-[6%] md:max-xl:translate-y-[4%] -rotate-7.5',
                    ])}
                  />
                ),
            )}
          </div>
        </div>
      </div>
    </div>
  </SectionContainer>
)

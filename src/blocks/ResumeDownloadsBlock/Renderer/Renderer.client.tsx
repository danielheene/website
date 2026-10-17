'use client'

import { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { ResumePreviewImage } from '@/blocks/ResumeDownloadsBlock/Renderer/ResumePreviewImage'
import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
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
  blockType: _blockType,
  document_en,
  document_de,
  thumbnails_en,
  thumbnails_de: _thumbnails_de,
}: ResumeDownloadsBlockClientRendererProps): JSX.Element => (
  <SectionContainer title={title} variant="default">
    <div className="container">
      <div className="relative flex flex-col overflow-hidden rounded-md bg-primary p-6 text-primary-foreground md:flex-row md:p-12 lg:p-20">
        <Reveal className="mb-72 flex flex-col items-center justify-center gap-8 md:mb-0 md:w-2/3 lg:shrink-0 xl:w-1/2">
          <Headline variant="section" data-reveal-item>
            {title}
          </Headline>
          <div data-reveal-item>
            <RichText
              data={caption}
              enableGutter={false}
              className="px-8 text-primary-foreground"
            />
          </div>

          <div
            data-reveal-item
            className="text-background-foreground flex flex-col justify-center gap-8 md:flex-row"
          >
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
        </Reveal>
        <div className="absolute right-1/2 bottom-0 mr-6 h-min w-[110%] max-w-md translate-x-1/2 md:-right-36 md:mr-0 md:w-3/4 md:max-w-xl md:translate-x-0 lg:mt-auto xl:relative xl:right-0 xl:size-full xl:max-w-full">
          <div className="relative aspect-8/5 size-full min-h-[16rem]">
            {[...thumbnails_en]
              .reverse()
              .map(
                (thumbnail, index) =>
                  index <= 3 && (
                    <ResumePreviewImage
                      {...thumbnail}
                      key={thumbnail.id}
                      className={cn([
                        index === 0 &&
                          'translate-x-[-24%] translate-y-[24%] -rotate-30 md:max-xl:translate-x-[-8%] md:max-xl:translate-y-[16%]',
                        index === 1 &&
                          'translate-x-[-12%] translate-y-[12%] -rotate-15 md:max-xl:translate-x-[-4%] md:max-xl:translate-y-[8%]',
                        index === 2 &&
                          '-rotate-7.5 translate-x-[-6%] translate-y-[6%] md:max-xl:translate-x-[-2%] md:max-xl:translate-y-[4%]',
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

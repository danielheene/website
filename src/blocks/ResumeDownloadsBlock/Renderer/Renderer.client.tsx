'use client'

import { JSX } from 'react'

import { cn } from 'tailwind-variants'

import { ResumePreviewImage } from '@/blocks/ResumeDownloadsBlock/Renderer/ResumePreviewImage'
import { Headline } from '@/components/Headline'
import { Reveal } from '@/components/Reveal'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import type { BlockAnchors } from '@/lib/extractHeadings'
import { isEmptyValue } from '@/lib/lexical/isEmptyValue'
import { MediaFile, MediaImage, ResumeDownloadsBlock } from '@/types/payload'

import { ResumeDownloadButton } from './ResumeDownloadButton'

// Offset and tilt per sheet, from the top sheet down.
const SHEET_CLASSES = ['rotate-0', 'translate-x-[-12%] -rotate-6', 'translate-x-[-24%] -rotate-12']

interface ResumeDownloadsBlockClientRendererProps extends ResumeDownloadsBlock, BlockAnchors {
  title: string
  document_en: MediaFile
  document_de: MediaFile
  thumbnails_en: MediaImage[]
  thumbnails_de: MediaImage[]
}

export const ResumeDownloadsBlockClientRenderer = ({
  anchorId,
  title,
  caption,
  blockType: _blockType,
  document_en,
  document_de,
  thumbnails_en,
  thumbnails_de: _thumbnails_de,
}: ResumeDownloadsBlockClientRendererProps): JSX.Element => (
  <SectionContainer id={anchorId} title={title} variant="default">
    <div className="container">
      <div className="relative overflow-hidden rounded-md bg-primary text-primary-foreground md:flex md:min-h-120 lg:min-h-136">
        <Reveal
          className={cn([
            'relative z-10 flex flex-col items-center justify-center gap-8 text-center',
            'px-6 pt-12 pb-72 sm:px-12 md:w-3/5 md:py-16 md:pr-0 md:pl-12 lg:py-20 lg:pl-16 xl:w-1/2',
          ])}
        >
          <Headline variant="section" data-reveal-item>
            {title}
          </Headline>
          {!isEmptyValue(caption) && (
            <div data-reveal-item>
              <RichText
                data={caption}
                enableGutter={false}
                enableProse={false}
                className="text-lg text-primary-foreground/90 md:text-xl"
              />
            </div>
          )}

          <div data-reveal-item className="grid w-full max-w-xl gap-4 sm:grid-cols-2 md:gap-6">
            {document_en?.url && (
              <ResumeDownloadButton
                locale="en"
                url={document_en.url}
                fileName={document_en.filename}
                label="Download"
                subline="English Version"
              />
            )}
            {document_de?.url && (
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

        {/* the first pages as a fanned stack of sheets, cut off by the box's bottom-right corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-64 w-full md:h-full md:w-2/5 xl:w-1/2"
        >
          {thumbnails_en
            .slice(0, SHEET_CLASSES.length)
            .reverse()
            .map((thumbnail, index, sheets) => (
              <ResumePreviewImage
                {...thumbnail}
                key={thumbnail.id}
                className={cn([
                  'right-[8%] -bottom-1/4 h-[110%] origin-bottom-right md:bottom-[-14%] md:h-[88%]',
                  // the top sheet (page 1) is the last one rendered
                  SHEET_CLASSES[sheets.length - 1 - index],
                ])}
              />
            ))}
        </div>
      </div>
    </div>
  </SectionContainer>
)

'use client'

import { JSX } from 'react'

import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from '@/components/SectionContainer'
import { ResumeDownloadsBlock } from '@/types/payload'

interface ResumeDownloadsBlockClientRendererProps extends ResumeDownloadsBlock {
  title: string
}

export const ResumeDownloadsBlockClientRenderer = ({
  title,
  caption,
  blockType,
}: ResumeDownloadsBlockClientRendererProps): JSX.Element => (
  <SectionContainer id={blockType} title={title} variant="default">
    <div className="container">
      <div className="relative flex flex-col p-6 md:p-12 lg:p-20 md:flex-row overflow-hidden bg-primary text-primary-foreground rounded-md">
        <div className="flex flex-col justify-center items-center mb-72 md:mb-0 gap-8 md:w-2/3 lg:shrink-0 xl:w-1/2">
          <Headline variant="section">{title}</Headline>
          <RichText data={caption} enableGutter={false} className="text-primary-foreground px-8" />

          {/*<div className="flex flex-col md:flex-row justify-center gap-8 text-background-foreground">*/}
          {/*  {isMediaDocument(document_en) && (*/}
          {/*    <ResumeDownloadButton*/}
          {/*      locale="en"*/}
          {/*      url={document_en.url}*/}
          {/*      fileName={document_en.filename}*/}
          {/*      label="Download"*/}
          {/*      subline="English Version"*/}
          {/*    />*/}
          {/*  )}*/}
          {/*  {isMediaDocument(document_de) && (*/}
          {/*    <ResumeDownloadButton*/}
          {/*      locale="de"*/}
          {/*      url={document_de.url}*/}
          {/*      fileName={document_de.filename}*/}
          {/*      label="Download"*/}
          {/*      subline="German Version"*/}
          {/*    />*/}
          {/*  )}*/}
          {/*</div>*/}
        </div>
        {/*<div className="absolute right-1/2 bottom-0 mr-6 h-min w-[110%] max-w-md translate-x-1/2 md:-right-36 md:mr-0 md:w-3/4 md:max-w-xl md:translate-x-0 lg:mt-auto xl:relative xl:right-0 xl:h-full xl:w-full xl:max-w-full">*/}
        {/*  <div className="relative aspect-8/5 h-full min-h-[16rem] w-full">*/}
        {/*    {isMediaDocument(document_en) && isMediaImage(document_en.thumbnail) && (*/}
        {/*      <>*/}
        {/*        <Image*/}
        {/*          style={{*/}
        {/*            aspectRatio: `${document_en.thumbnail.width} / ${document_en.thumbnail.height}`,*/}
        {/*          }}*/}
        {/*          className={cn([*/}
        {/*            'absolute top-0 right-0 z-40 flex w-3/5',*/}
        {/*            'translate-x-[-24%] md:max-xl:translate-x-[-8%] translate-y-[24%] md:max-xl:translate-y-[16%] -rotate-30',*/}
        {/*            'justify-center overflow-clip rounded-sm bg-background shadow-lg shadow-foreground/20 ',*/}
        {/*          ])}*/}
        {/*          src={document_en.thumbnail.url}*/}
        {/*          blurDataURL={document_en.thumbnail.blurDataURL}*/}
        {/*          alt={document_en.thumbnail.alt}*/}
        {/*          width={document_en.thumbnail.width}*/}
        {/*          height={document_en.thumbnail.height}*/}
        {/*        />*/}
        {/*        <Image*/}
        {/*          style={{*/}
        {/*            aspectRatio: `${document_en.thumbnail.width} / ${document_en.thumbnail.height}`,*/}
        {/*          }}*/}
        {/*          className={cn([*/}
        {/*            'absolute top-0 right-0 z-40 flex w-3/5',*/}
        {/*            'translate-x-[-16%] md:max-xl:translate-x-[-6%] translate-y-[8%] md:max-xl:translate-y-[6%] -rotate-15',*/}
        {/*            'justify-center overflow-clip rounded-sm bg-background shadow-xl shadow-foreground/20  ',*/}
        {/*          ])}*/}
        {/*          src={document_en.thumbnail.url}*/}
        {/*          blurDataURL={document_en.thumbnail.blurDataURL}*/}
        {/*          alt={document_en.thumbnail.alt}*/}
        {/*          width={document_en.thumbnail.width}*/}
        {/*          height={document_en.thumbnail.height}*/}
        {/*        />*/}
        {/*        <Image*/}
        {/*          style={{*/}
        {/*            aspectRatio: `${document_en.thumbnail.width} / ${document_en.thumbnail.height}`,*/}
        {/*          }}*/}
        {/*          className={cn([*/}
        {/*            'absolute top-0 right-0 z-40 flex w-3/5',*/}
        {/*            'items-center justify-center overflow-clip rounded-sm bg-background shadow-2xl shadow-foreground/20',*/}
        {/*          ])}*/}
        {/*          src={document_en.thumbnail.url}*/}
        {/*          blurDataURL={document_en.thumbnail.blurDataURL}*/}
        {/*          alt={document_en.thumbnail.alt}*/}
        {/*          width={document_en.thumbnail.width}*/}
        {/*          height={document_en.thumbnail.height}*/}
        {/*        />*/}
        {/*      </>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </div>
  </SectionContainer>
)

'use client'

import { Headline } from '@repo/ui/Headline'
import { SectionContainer } from '@repo/ui/SectionContainer'
import { cn } from '@repo/utils/cn'

import RichText from '@/components/RichText'
import { ResumeContactBlock } from '@/types/payload'

interface ResumeContactBlockClientRendererProps extends ResumeContactBlock {
  title: string
}

export const ResumeContactBlockClientRenderer = ({
  blockType,
  title,
  caption,
}: ResumeContactBlockClientRendererProps) => (
  <SectionContainer id={blockType} title={title} variant="default">
    <div className={cn('container grid grid-cols-12 py-32', 'text-center')}>
      {title && (
        <div className="col-span-12 md:col-start-3 md:col-span-8">
          <Headline variant="section">{title}</Headline>
        </div>
      )}
      {caption && (
        <div className="col-span-12 md:col-start-2 md:col-span-10  my-8 text-xl">
          <RichText data={caption} enableGutter={false} className="text-lg" />
        </div>
      )}
      {/*{mailButton?.label && mailButton?.href && (*/}
      {/*  <Button asChild variant="default" type="submit">*/}
      {/*    <Link className="font-bold text-xl col-span-12 md:col-start-4 md:col-span-6 my-2 cursor-pointer" href={mailButton.href}>*/}
      {/*      {mailButton.label}*/}
      {/*    </Link>*/}
      {/*  </Button>*/}
      {/*)}*/}
    </div>
  </SectionContainer>
)

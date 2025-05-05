import { cn } from '@/utilities/cn'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'
import { Button } from '@/components/Button'
import Link from 'next/link'

export const ResumeContactSection = ({
  className,
  anchor,
  title,
  caption,
  mailButton,
}: SectionProps<'resumeContact'>) => {
  return (
    <SectionContainer id={anchor} className={cn(['bg-white', className])} title={title}>
      <div className={cn('container grid grid-cols-12 py-32', 'text-center text-primary')}>
        {title && (
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <Headline variant="section">{title}</Headline>
          </div>
        )}
        {caption && (
          <div className="col-span-12 md:col-start-2 md:col-span-10  my-8 text-xl">
            <RichText content={caption} enableGutter={false} className="text-lg" />
          </div>
        )}
        {mailButton?.label && mailButton?.href && (
          <Button asChild variant="default" type="submit">
            <Link
              className="font-bold text-xl col-span-12 md:col-start-4 md:col-span-6 my-2 cursor-pointer"
              href={mailButton.href}
            >
              {mailButton.label}
            </Link>
          </Button>
        )}
      </div>
    </SectionContainer>
  )
}

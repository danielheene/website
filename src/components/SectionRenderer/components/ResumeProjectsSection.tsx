import { cn } from '@/utilities/cn'
import { Headline } from '@/components/Headline'
import RichText from '@/components/RichText'
import { SectionContainer } from './SectionContainer'
import { SectionProps } from '@custom-types'
import { ResumeProjectsSectionEntry } from './ResumeProjectsSection.Entry'

export const ResumeProjectsSection = ({
  className,
  anchor,
  title,
  caption,
  entries,
}: SectionProps<'resumeProjects'>) => {
  return (
    <SectionContainer
      id={anchor}
      title={title}
      className={cn(['bg-white text-foreground overflow-hidden', className])}
    >
      <div className={cn('container', 'py-32', 'flex', 'flex-col', 'gap-32')}>
        <header className={cn('text-center', 'mb-14', 'flex flex-col gap-24')}>
          {title && <Headline variant="section">{title}</Headline>}
          {caption && <RichText content={caption} enableGutter={false} />}
        </header>

        {entries.map((entry, index) => {
          return <ResumeProjectsSectionEntry key={index} index={index} {...entry} />
        })}
      </div>
    </SectionContainer>
  )
}

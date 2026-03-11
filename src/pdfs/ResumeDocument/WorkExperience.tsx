import type { ResumeExperienceGlobalData } from '@payload-types'
import { WorkExperienceEntry } from '@/pdfs/ResumeDocument/WorkExperienceEntry'
import { Section } from '@/pdfs/ResumeDocument/Section'

interface WorkExperienceProps extends ResumeExperienceGlobalData {
  locale?: string
}


export const WorkExperience = ({ title, jobHistory, locale }: WorkExperienceProps) => (
  <Section title={title}>
    {jobHistory.map((job, index) => (
      <WorkExperienceEntry key={index} locale={locale} {...job} />
    ))}
  </Section>
)

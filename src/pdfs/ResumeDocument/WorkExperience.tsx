import type { ResumeExperienceGlobalData } from '@/types/payload'
import type { DeepReduced } from '@/lib/reduceDataToLocale'
import { WorkExperienceEntry } from '@/pdfs/ResumeDocument/WorkExperienceEntry'
import { Section } from '@/pdfs/ResumeDocument/Section'

interface WorkExperienceProps extends DeepReduced<ResumeExperienceGlobalData> {
  locale?: string
}


export const WorkExperience = ({ title, jobHistory, locale }: WorkExperienceProps) => (
  <Section title={title}>
    {jobHistory.map((job, index) => (
      <WorkExperienceEntry key={index} locale={locale} {...job} />
    ))}
  </Section>
)

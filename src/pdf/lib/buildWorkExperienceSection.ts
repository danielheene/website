'use server'

import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { getJobsCollectionData } from '@/lib/getJobsCollectionData'
import { generateExperienceInterval, type Locale, translate } from '@/lib/i18n'
import { DocumentSectionType, WorkExperienceSection } from '@/pdf/types'

export const buildWorkExperienceSection = async (
  locale: Locale,
): Promise<WorkExperienceSection> => {
  const jobs = await getJobsCollectionData(locale)

  return {
    type: DocumentSectionType.WorkExperience,
    data: {
      headline: translate(locale, 'document.workExperience.headline'),
      entries: jobs.map(({ title, employer, startDate, endDate, tasks }) => ({
        title: `${title}, ${employer}`,
        interval: generateExperienceInterval({
          startDate,
          endDate,
          locale,
        }),
        tasks: tasks.map(({ task }) =>
          convertLexicalToPlaintext({
            data: task,
          }),
        ),
      })),
    },
  }
}

'use server'

import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { fetchResumeJobs } from '@/lib/fetchers'
import {
  type BilingualLanguage,
  generateExperienceInterval,
  reduceDataToBilingualLanguage,
  translate,
} from '@/lib/i18n'
import { DocumentSectionType, WorkExperienceSection } from '@/pdf/types'

export const buildWorkExperienceSection = async (
  locale: BilingualLanguage,
): Promise<WorkExperienceSection> => {
  const data = await fetchResumeJobs()
  const jobs = reduceDataToBilingualLanguage(data)

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

'use server'

import {
  type BilingualLanguage,
  generateExperienceInterval,
  reduceDataToBilingualLanguage,
  translate,
} from '@website/lib/i18n'

import { fetchResumeJobs } from '@/lib/fetchers'
import { DocumentSectionType, WorkExperienceSection } from '@/pdf/types'

export const buildWorkExperienceSection = async (
  locale: BilingualLanguage,
): Promise<WorkExperienceSection> => {
  const data = await fetchResumeJobs(locale)
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
        tasks: tasks.map(({ task }) => ({
          task,
        })),
      })),
    },
  }
}

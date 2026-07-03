import { z } from 'zod'

import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import { DocumentSectionType } from '@pdf/types'
import { generateExperienceInterval, type Locale, translate } from '@/lib/i18n'
import type { CollectionData, CollectionSlug } from '@/types/collections'

const workExperienceSectionSchema = z.object({
  headline: z.string(),
  entries: z.array(
    z.object({
      title: z.string(),
      interval: z.string(),
      tasks: z.nullable(z.array(z.string())),
    }),
  ),
})

export type WorkExperienceSectionData = z.infer<typeof workExperienceSectionSchema>

export type WorkExperienceSection = {
  type: DocumentSectionType.WorkExperience
  data: WorkExperienceSectionData
}

interface BuildWorkExperienceSectionArgs {
  locale: Locale
  jobs: CollectionData<CollectionSlug.ResumeJobs>[]
}

export const buildWorkExperienceSection = ({
  locale,
  jobs,
}: BuildWorkExperienceSectionArgs): WorkExperienceSection => ({
  type: DocumentSectionType.WorkExperience,
  data: workExperienceSectionSchema.parse({
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
  }),
})

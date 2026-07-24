'use server'

import { Suspense } from 'react'

import { fetchResumeJobsCached } from '@/lib/fetchers/fetchResumeJobs'
import { fetchResumeSkillTagsCached } from '@/lib/fetchers/fetchResumeSkillTags'
import { reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeExperienceBlock } from '@/types/payload'

import { ResumeExperienceBlockClientRenderer } from './Renderer.client'

export const ResumeExperienceBlockRenderer = async ({
  caption,
  blockType,
}: ResumeExperienceBlock) => {
  const title = 'Experience'

  const rawjobs = await fetchResumeJobsCached()
  const skillTags = await fetchResumeSkillTagsCached()
  const jobs = reduceDataToLocale(await resolveRelations(rawjobs))

  return (
    <Suspense>
      <ResumeExperienceBlockClientRenderer
        title={title}
        jobs={jobs}
        skillTags={skillTags}
        blockType={blockType}
        caption={caption}
      />
    </Suspense>
  )
}

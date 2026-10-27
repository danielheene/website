'use server'

import { Suspense } from 'react'

import { reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { ResumeExperienceBlock } from '@website/types/payload'

import { fetchResumeJobsCached } from '@/lib/fetchers/fetchResumeJobs'
import { fetchResumeSkillTagsCached } from '@/lib/fetchers/fetchResumeSkillTags'
import { resolveRelations } from '@/lib/resolveRelation'

import { ResumeExperienceBlockClientRenderer } from './Renderer.client'

export const ResumeExperienceBlockRenderer = async ({
  title,
  caption,
  blockType,
}: ResumeExperienceBlock) => {
  const rawjobs = await fetchResumeJobsCached()
  const skillTags = await fetchResumeSkillTagsCached()
  const jobs = reduceDataToBilingualLanguage(await resolveRelations(rawjobs))

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

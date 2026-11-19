import { Suspense } from 'react'

import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchResumeJobsCached } from '@/lib/fetchers/fetchResumeJobs'
import { fetchResumeSkillTagsCached } from '@/lib/fetchers/fetchResumeSkillTags'
import { reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeExperienceBlock } from '@/types/payload'

import { ResumeExperienceBlockClientRenderer } from './Renderer.client'

export const ResumeExperienceBlockRenderer = async ({
  anchorId,
  title,
  caption,
  blockType,
}: ResumeExperienceBlock & BlockAnchors) => {
  const rawjobs = await fetchResumeJobsCached()
  const skillTags = await fetchResumeSkillTagsCached()
  const jobs = reduceDataToBilingualLanguage(await resolveRelations(rawjobs))

  return (
    <Suspense>
      <ResumeExperienceBlockClientRenderer
        anchorId={anchorId}
        title={title}
        jobs={jobs}
        skillTags={skillTags}
        blockType={blockType}
        caption={caption}
      />
    </Suspense>
  )
}

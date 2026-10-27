'use server'

import { reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { ResumeProjectsBlock } from '@website/types/payload'

import { fetchResumeProjectsCached } from '@/lib/fetchers/fetchResumeProjects'
import { resolveRelations } from '@/lib/resolveRelation'

import { ResumeProjectsBlockClientRenderer } from './Renderer.client'

export const ResumeProjectsBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeProjectsBlock) => {
  const rawProjects = await fetchResumeProjectsCached()
  const projects = reduceDataToBilingualLanguage(await resolveRelations(rawProjects))

  return (
    <ResumeProjectsBlockClientRenderer
      title={title}
      projects={projects}
      blockType={blockType}
      caption={caption}
    />
  )
}

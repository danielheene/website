'use server'

import { fetchResumeProjectsCached } from '@/lib/fetchers/fetchResumeProjects'
import { reduceDataToLocale } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeProjectsBlock } from '@/types/payload'

import { ResumeProjectsBlockClientRenderer } from './Renderer.client'

export const ResumeProjectsBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeProjectsBlock) => {
  const rawProjects = await fetchResumeProjectsCached()
  const projects = reduceDataToLocale(await resolveRelations(rawProjects))

  return (
    <ResumeProjectsBlockClientRenderer
      title={title}
      projects={projects}
      blockType={blockType}
      caption={caption}
    />
  )
}

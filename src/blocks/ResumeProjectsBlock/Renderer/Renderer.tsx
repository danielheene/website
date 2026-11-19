import type { BlockAnchors } from '@/lib/extractHeadings'
import { fetchResumeProjectsCached } from '@/lib/fetchers/fetchResumeProjects'
import { reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { ResumeProjectsBlock } from '@/types/payload'

import { ResumeProjectsBlockClientRenderer } from './Renderer.client'

export const ResumeProjectsBlockRenderer = async ({
  anchorId,
  title,
  blockType,
  caption,
}: ResumeProjectsBlock & BlockAnchors) => {
  const rawProjects = await fetchResumeProjectsCached()
  const projects = reduceDataToBilingualLanguage(await resolveRelations(rawProjects))

  return (
    <ResumeProjectsBlockClientRenderer
      anchorId={anchorId}
      title={title}
      projects={projects}
      blockType={blockType}
      caption={caption}
    />
  )
}

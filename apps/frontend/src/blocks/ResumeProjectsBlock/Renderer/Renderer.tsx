'use server'

import { reduceDataToBilingualLanguage } from '@website/lib/i18n'
import { ResumeProjectsBlock } from '@website/types/payload'

import { fetchResumeProjectsCached } from '@/lib/fetchers/fetchResumeProjects'
import { fetchDocumentByID } from '@/lib/payloadClient'

import { ResumeProjectsBlockClientRenderer } from './Renderer.client'

export const ResumeProjectsBlockRenderer = async ({
  title,
  blockType,
  caption,
}: ResumeProjectsBlock) => {
  const rawProjects = await fetchResumeProjectsCached()

  const projects = reduceDataToBilingualLanguage(
    await Promise.all(
      rawProjects.map(async (project) => {
        const images = project.images

        if (images?.[0]?.value && typeof images[0].value === 'string') {
          const media = await fetchDocumentByID('media', images[0].value)

          return { ...project, images: [{ ...images[0], value: media }] }
        }

        return project
      }),
    ),
  )

  return (
    <ResumeProjectsBlockClientRenderer
      title={title}
      projects={projects as Parameters<typeof ResumeProjectsBlockClientRenderer>[0]['projects']}
      blockType={blockType}
      caption={caption}
    />
  )
}

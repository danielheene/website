import { GlobalSlug } from '@custom-types'
import type { AdminViewServerProps } from 'payload'

import ResumePdfViewClientComponent from '@/collections/Pages/components/ResumePdfView.client'
import { getGlobal } from '@/utilities/getGlobals'

export default async function ResumePdfViewComponent({ initPageResult }: AdminViewServerProps) {
  const {
    req: { user, data },
  } = initPageResult

  if (!user || data.slug !== 'resume') return null

  const experience = await getGlobal(GlobalSlug.ResumeExperience, 1)

  return <ResumePdfViewClientComponent experience={experience} />
}

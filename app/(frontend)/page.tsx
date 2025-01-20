import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { SectionRenderer } from '@/components/SectionRenderer'
import { generateMeta } from '@/utilities/generateMeta'
import { ResolvingMetadata } from 'next'

export default async function Page() {
  const sections = await Promise.all([
    getCachedGlobal('resumeHero', 1)(),
    getCachedGlobal('resumeAboutMe', 1)(),
    getCachedGlobal('resumeExperience', 1)(),
    getCachedGlobal('resumeProjects', 1)(),
    getCachedGlobal('resumeCustomers', 1)(),
    getCachedGlobal('resumeContact', 1)(),
  ])

  return <SectionRenderer sections={sections} />
}

export async function generateMetadata(_props, parent: ResolvingMetadata) {
  const globalMeta = await getCachedGlobal('settingsMeta', 1)()
  const parentMeta = await parent
  return generateMeta({ doc: { meta: { title: 'Portfolio' } }, globalMeta, parentMeta })
}

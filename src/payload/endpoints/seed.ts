import { File, type PayloadHandler } from 'payload'

import resumeHeroData from './data/resumeHero'
import resumeHeroBackgroundImageData from './data/resumeHeroBackgroundImage'
import resumeHeroPortraitImageData from './data/resumeHeroPortraitImage'
import resumeAboutMeData from './data/resumeAboutMe'
import resumeAboutMePortraitImageData from './data/resumeAboutMePortraitImage'
import resumeProjectsData from './data/resumeProjects'
import resumeProjectsImage1Data from './data/resumeProjectsImage1'
import resumeProjectsImage2Data from './data/resumeProjectsImage2'
import resumeExperienceData from './data/resumeExperience'
import resumeCustomersData from './data/resumeCustomers'
import resumeContactData from './data/resumeContact'
import imprintData from './data/imprint'
import imprintHeroImageData from './data/imprintHeroImage'
import settingsNavigationData from './data/settingsNavigation'

export const seedHandler: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    /**
     *    RESUME HERO
     */
    payload.logger.info('-- Seeding: Resume Hero')

    const { id: resumeHeroBackgroundId } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(resumeHeroBackgroundImageData)),
      file: await fetchFileByURL({
        src: '/seed/resumeHero-background.webp',
        name: 'resume-hero-background.webp',
      }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeHero background image created')

    const { id: resumeHeroPortraitId } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(resumeHeroPortraitImageData)),
      file: await fetchFileByURL({
        src: '/seed/resumeHero-portrait.webp',
        name: 'resume-hero-portrait.webp',
      }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeHero portrait image created')

    await payload.updateGlobal({
      slug: 'resumeHero',
      data: JSON.parse(
        JSON.stringify(resumeHeroData)
          .replace(/"<BACKGROUND_IMAGE>"/g, String(resumeHeroBackgroundId))
          .replace(/"<PORTRAIT_IMAGE>"/g, String(resumeHeroPortraitId)),
      ),
      depth: 0,
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeHero data updated')
    payload.logger.info('')

    /**
     *    RESUME ABOUT ME
     */
    payload.logger.info('-- Seeding: Resume AboutMe')

    const { id: resumeAboutMePortraitId } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(resumeAboutMePortraitImageData)),
      file: await fetchFileByURL({
        src: '/seed/resumeAboutMe-portrait.webp',
        name: 'resume-about-me-portrait.webp',
      }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeAboutMe portrait image created')

    await payload.updateGlobal({
      slug: 'resumeAboutMe',
      data: JSON.parse(
        JSON.stringify(resumeAboutMeData).replace(
          /"<PORTRAIT_IMAGE>"/g,
          String(resumeAboutMePortraitId),
        ),
      ),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeAboutMe data updated')
    payload.logger.info('')

    /**
     *    RESUME EXPERIENCE
     */
    payload.logger.info('-- Seeding: Resume Experience')

    await payload.updateGlobal({
      slug: 'resumeExperience',
      data: JSON.parse(JSON.stringify(resumeExperienceData)),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeExperience data updated')
    payload.logger.info('')

    /**
     *    RESUME PROJECTS
     */
    payload.logger.info('-- Seeding: Resume Projects')

    const { id: resumeProjectsImage1Id } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(resumeProjectsImage1Data)),
      file: await fetchFileByURL({
        src: '/seed/resumeProjects-image1.webp',
        name: 'aktion-mensch-screenshot.webp',
      }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeProjects image1 uploaded')

    const { id: resumeProjectsImage2Id } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(resumeProjectsImage2Data)),
      file: await fetchFileByURL({
        src: '/seed/resumeProjects-image2.webp',
        name: 'personal-website-screenshot.webp',
      }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeProjects image2 uploaded')

    await payload.updateGlobal({
      slug: 'resumeProjects',
      data: JSON.parse(
        JSON.stringify(resumeProjectsData)
          .replace(/"<IMAGE_1>"/g, String(resumeProjectsImage1Id))
          .replace(/"<IMAGE_2>"/g, String(resumeProjectsImage2Id)),
      ),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeProjects data updated')
    payload.logger.info('')

    /**
     *    RESUME CUSTOMERS
     */
    payload.logger.info('-- Seeding: Resume Customers')

    await payload.updateGlobal({
      slug: 'resumeCustomers',
      data: JSON.parse(JSON.stringify(resumeCustomersData)),
      context: {
        isSeedContext: true,
      },
    })
    payload.logger.info('    resumeCustomers data updated')
    payload.logger.info('')

    /**
     *    RESUME CONTACT
     */
    payload.logger.info('-- Seeding: Resume Contact')

    await payload.updateGlobal({
      slug: 'resumeContact',
      data: JSON.parse(JSON.stringify(resumeContactData)),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    resumeContact data updated')
    payload.logger.info('')

    /**
     *    PAGES
     */
    payload.logger.info('-- Seeding: Pages')

    await payload.delete({
      collection: 'pages',
      where: { id: { exists: true } },
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    previous pages deleted')

    const { id: imprintHeroId } = await payload.create({
      collection: 'media',
      data: JSON.parse(JSON.stringify(imprintHeroImageData)),
      file: await fetchFileByURL({ src: '/seed/imprint-hero.webp', name: 'imprint-hero.webp' }),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    imprint page hero image uploaded')

    const { id: imprintPageId } = await payload.create({
      collection: 'pages',
      data: JSON.parse(
        JSON.stringify(imprintData).replace(/"<HERO_IMAGE>"/g, String(imprintHeroId)),
      ),
      context: {
        isSeedContext: true,
      },
    })
    payload.logger.info('    imprint page data updated')
    payload.logger.info('')

    /**
     *    SETTINGS NAVIGATION
     */
    payload.logger.info('-- Seeding: Settings Navigation')

    await payload.updateGlobal({
      slug: 'settingsNavigation',
      data: JSON.parse(
        JSON.stringify(settingsNavigationData).replace(
          /"<IMPRINT_PAGE_ID>"/g,
          String(imprintPageId),
        ),
      ),
      context: {
        isSeedContext: true,
      },
    })

    payload.logger.info('    settingsNavigation data updated')
    payload.logger.info('')

    return Response.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

async function fetchFileByURL({ src, name }: { src: string; name: string }): Promise<File> {
  const url = new URL(src, process.env.PAYLOAD_PUBLIC_SERVER_URL)
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name,
    data: Buffer.from(data),
    mimetype: `image/${url.toString().split('.').pop()}`,
    size: data.byteLength,
  }
}

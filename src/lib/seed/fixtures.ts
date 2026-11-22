import type { Payload, PayloadRequest } from 'payload'

import { heading, paragraph, root, text } from '@/lib/seed/lexical'
import { BlockSlug } from '@/types/blocks'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'

/**
 * Content the protected pages need to render something meaningful: the résumé page's blocks with
 * their captions and the legal notice's data blocks. Applied by the baseline migration and by
 * `bun run seed:fixtures`; only ever fills what is empty, so edited content is left alone.
 */

type ResumeSection = {
  blockType: string
  title: string
  caption: ReturnType<typeof root> | null
}

const caption = (value: string) => root([paragraph([text(value)])])

const RESUME_SECTIONS: ResumeSection[] = [
  {
    blockType: BlockSlug.ResumeAboutMe,
    title: 'About Me',
    caption: caption('A short introduction: who I am, what I work on and what drives me.'),
  },
  {
    blockType: BlockSlug.ResumeExperience,
    title: 'Experience',
    caption: caption('The positions I have held, with the skills each of them sharpened.'),
  },
  {
    blockType: BlockSlug.ResumeProjects,
    title: 'Projects',
    caption: caption('A selection of projects I have built or shaped, and the stack behind each.'),
  },
  {
    blockType: BlockSlug.ResumeCustomers,
    title: 'Customers',
    caption: caption('Companies and teams I have had the pleasure to work with.'),
  },
  {
    blockType: BlockSlug.ResumeContact,
    title: 'Contact',
    caption: caption(
      'Have a project in mind, a role to fill or just a question? Send me a message, or reach out directly by mail or phone.',
    ),
  },
  {
    blockType: BlockSlug.ResumeDownloads,
    title: 'Downloads',
    caption: caption(
      'Take the résumé with you as a PDF, in English or German. Each file carries a checksum you can verify.',
    ),
  },
]

const blockNode = (blockType: string) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: {
    blockType,
    blockName: '',
  },
})

const LEGAL_NOTICE_CONTENT = root([
  heading('Publisher Information'),
  blockNode(BlockSlug.LegalPublisherInformation),
  heading('Attributions / Resource Credits'),
  blockNode(BlockSlug.LegalAttributions),
])

type FixtureArgs = {
  payload: Payload
  req?: Partial<PayloadRequest>
}

type FixtureResult = {
  slug: string
  changed: string[]
}

// SAFETY: fixtures are built from block slugs and the seed's Lexical helpers, so they match the
// fields' schema; the generated types are just too wide to infer that from literals
const asPageField = <T>(value: ResumeSection[] | ReturnType<typeof root>): T => value as T

// No Next context in the migrate CLI or a script to revalidate from.
const context = {
  skipRevalidate: true,
}

const findPage = async ({ payload, req }: FixtureArgs, slug: string): Promise<Page | null> => {
  const { docs } = await payload.find({
    collection: CollectionSlug.Pages,
    depth: 0,
    limit: 1,
    req,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs[0] ?? null
}

/** The résumé sections with any missing caption filled in, or all of them when there are none. */
const resumeSectionsWithFixtures = (sections: Page['sections']): Page['sections'] | null => {
  if (!sections?.length) {
    return asPageField<Page['sections']>(RESUME_SECTIONS)
  }

  let changed = false

  const filled = sections.map((section) => {
    const fixture = RESUME_SECTIONS.find(({ blockType }) => blockType === section.blockType)

    // an empty caption may be stored as `null` or not at all; only résumé blocks have a fixture
    if (!fixture || ('caption' in section && section.caption)) return section

    changed = true

    return {
      ...section,
      caption: fixture.caption,
    }
  })

  // SAFETY: only the `caption` of résumé blocks was added, which their schema declares
  return changed ? (filled as Page['sections']) : null
}

export const applyPageFixtures = async (args: FixtureArgs): Promise<FixtureResult[]> => {
  const { payload, req } = args
  const results: FixtureResult[] = []

  const resume = await findPage(args, 'resume')
  const sections = resume ? resumeSectionsWithFixtures(resume.sections) : null

  if (resume && sections) {
    await payload.update({
      collection: CollectionSlug.Pages,
      id: resume.id,
      context,
      data: {
        sections,
        _status: 'published',
      },
      draft: false,
      req,
    })

    results.push({ slug: 'resume', changed: ['sections'] })
  }

  const legalNotice = await findPage(args, 'legal-notice')

  if (legalNotice && !legalNotice.content?.root?.children?.length) {
    await payload.update({
      collection: CollectionSlug.Pages,
      id: legalNotice.id,
      context,
      data: {
        content: asPageField<Page['content']>(LEGAL_NOTICE_CONTENT),
        _status: 'published',
      },
      draft: false,
      req,
    })

    results.push({ slug: 'legal-notice', changed: ['content'] })
  }

  return results
}

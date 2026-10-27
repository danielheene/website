/**
 *    Seeds two fixture ResumeDocuments (an older and a newer one, no PDFs)
 *    so `/resume/latest` and `/resume/<slug>` render without running the
 *    resume generator.
 *
 *    Usage:
 *      bun run seed:resume-documents        # create the two documents
 *      bun run seed:resume-documents:clean  # remove them
 *
 *    Idempotent: existing seeded documents (matched by slug) are skipped.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { cleanResumeDocuments, seedResumeDocuments } from '@/lib/seed/resumeDocuments'

const payload = await getPayload({
  config,
})

const onProgress = ({ step, current, total }: { step: string; current: number; total: number }) => {
  console.info(`[${current}/${total}] ${step}`)
}

if (process.argv.includes('--clean')) {
  const { deleted } = await cleanResumeDocuments(payload, onProgress)
  console.info(`\nRemoved ${deleted} resume documents.`)
} else {
  const { created } = await seedResumeDocuments(payload, onProgress)
  console.info(`\nCreated ${created} resume documents.`)
}

process.exit(0)

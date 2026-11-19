import { format } from 'date-fns'

/** The meta description of a resume document page, shared with its Open Graph card. */
export const resumeDocumentDescription = (
  createdAt: string | null | undefined,
  name: string | null | undefined,
): string => {
  const by = name ? ` by ${name}` : ''
  const generated = createdAt ? ` generated on ${format(new Date(createdAt), 'PP')}` : ''

  return `Resume document${generated}${by}. Download the PDF or validate a copy's checksum.`
}

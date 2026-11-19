import { describe, expect, it } from 'vitest'

import { resumeDocumentDescription } from './resumeDocumentDescription'

describe('resumeDocumentDescription', () => {
  it('names the date and author', () => {
    expect(resumeDocumentDescription('2026-11-18T10:00:00.000Z', 'Daniel Heene')).toBe(
      "Resume document generated on Nov 18, 2026 by Daniel Heene. Download the PDF or validate a copy's checksum.",
    )
  })

  it('leaves out what is unknown', () => {
    expect(resumeDocumentDescription(undefined, undefined)).toBe(
      "Resume document. Download the PDF or validate a copy's checksum.",
    )
  })
})

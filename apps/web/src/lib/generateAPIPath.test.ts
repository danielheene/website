import { describe, expect, it } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import { generateAPIPath } from './generateAPIPath'

describe('generateAPIPath', () => {
  it('builds the API path from collection and id', () => {
    expect(generateAPIPath(CollectionSlug.Pages, 'abc')).toBe('/api/pages/abc')
    expect(generateAPIPath(CollectionSlug.ResumeDocuments, '42')).toBe('/api/resume-documents/42')
  })
})

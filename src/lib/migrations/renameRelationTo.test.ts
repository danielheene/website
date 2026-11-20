import { describe, expect, it } from 'vitest'

import { renameRelationTo } from './renameRelationTo'

describe('renameRelationTo', () => {
  it('renames polymorphic relations at any depth and keeps other values', () => {
    // stands in for a driver ObjectId: a class instance, not a plain object
    const id = new (class ObjectId {
      relationTo = 'documents'
    })()
    const createdAt = new Date()

    const result = renameRelationTo(
      {
        _id: id,
        createdAt,
        pdf: { relationTo: 'documents', value: 'a' },
        links: [{ doc: { relationTo: 'documents', value: 'b' } }, { relationTo: 'pages' }],
        documents: { en: 'c' },
      },
      'documents',
      'files',
    )

    expect(result).toEqual({
      _id: id,
      createdAt,
      pdf: { relationTo: 'files', value: 'a' },
      links: [{ doc: { relationTo: 'files', value: 'b' } }, { relationTo: 'pages' }],
      documents: { en: 'c' },
    })
    expect(result?._id).toBe(id)
  })

  it('returns null when nothing matches', () => {
    expect(renameRelationTo({ relationTo: 'resume-documents' }, 'documents', 'files')).toBeNull()
  })
})

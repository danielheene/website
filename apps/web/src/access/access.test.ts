import type { Access } from 'payload'

import { describe, expect, it } from 'vitest'

import { anyone } from './anyone'
import { authenticated } from './authenticated'
import { authenticatedOrPublished } from './authenticatedOrPublished'
import { forbidden } from './forbidden'

type AccessArgs = Parameters<Access>[0]

const withUser = {
  req: {
    user: {
      id: '1',
    },
  },
} as unknown as AccessArgs
const withoutUser = {
  req: {
    user: null,
  },
} as unknown as AccessArgs

describe('anyone', () => {
  it('always grants access', () => {
    expect(anyone(withoutUser)).toBe(true)
    expect(anyone(withUser)).toBe(true)
  })
})

describe('forbidden', () => {
  it('always denies access', () => {
    expect(forbidden(withoutUser)).toBe(false)
    expect(forbidden(withUser)).toBe(false)
  })
})

describe('authenticated', () => {
  it('grants access with a user', () => {
    expect(authenticated(withUser)).toBe(true)
  })

  it('denies access without a user', () => {
    expect(authenticated(withoutUser)).toBe(false)
  })
})

describe('authenticatedOrPublished', () => {
  it('grants full access with a user', () => {
    expect(authenticatedOrPublished(withUser)).toBe(true)
  })

  it('restricts unauthenticated requests to published documents', () => {
    expect(authenticatedOrPublished(withoutUser)).toEqual({
      _status: {
        equals: 'published',
      },
    })
  })
})

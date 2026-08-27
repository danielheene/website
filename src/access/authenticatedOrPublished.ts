import type { Access } from 'payload'

/**
 * Access control function that grants access to authenticated users or restricts unauthenticated users to published content only.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}

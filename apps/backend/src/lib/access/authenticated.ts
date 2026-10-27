import type { Access } from 'payload'

/**
 * Checks whether the current request contains an authenticated user.
 */
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

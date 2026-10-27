import type { CollectionConfig, Config, GlobalConfig, Plugin } from 'payload'
import { APIError } from 'payload'

/**
 * The operation names Payload's `beforeOperation` hook reports for writes.
 */
const WRITE_OPERATIONS = new Set<string>([
  'create',
  'update',
  'delete',
  'updateByID',
  'deleteByID',
  'updateGlobal',
  'unlock',
])

/**
 * Reads the authenticated user's role.
 *
 * `req.user` is only loosely typed at the plugin level (Payload types it as a
 * generic user with an index signature), and `role` collides with Payload's own
 * i18n `t` helper on that type, so the field is read through a narrow cast.
 */
const getUserRole = (req: { user?: unknown }): string | undefined => {
  const user = req.user as { role?: unknown } | undefined

  return typeof user?.role === 'string' ? user.role : undefined
}

/**
 * Whether the hook's `operation` is one of the write operations.
 *
 * Payload types `operation` as its own i18n `t` helper, so the value is
 * compared as a plain string here.
 */
const isWriteOperation = (operation: unknown): boolean =>
  typeof operation === 'string' && WRITE_OPERATIONS.has(operation)

/**
 * `frontendReadOnly` plugin: blocks all write operations (create, update,
 * delete, updateByID, deleteByID, updateGlobal, unlock) on every collection
 * and global when `req.user?.role === 'frontend'`.
 *
 * Reads are unaffected — the `frontend` role passes `authenticated` access
 * control, so frontend-role API keys can read everything.
 *
 * Attaches a `beforeOperation` hook to every collection and global. If the
 * installed Payload version does not run `beforeOperation` with
 * `overrideAccess: true`, enforcement must also be added via `beforeChange`
 * / `beforeDelete` hooks.
 */
export const frontendReadOnlyPlugin =
  (): Plugin =>
  (incomingConfig: Config): Config => {
    const withFrontendReadOnly = (collection: CollectionConfig): CollectionConfig => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeOperation: [
          ...(collection.hooks?.beforeOperation ?? []),
          async ({ operation, req }) => {
            if (isWriteOperation(operation) && getUserRole(req) === 'frontend') {
              throw new APIError('Frontend-role users cannot perform write operations', 403)
            }
          },
        ],
      },
    })

    const withGlobalReadOnly = (global: GlobalConfig): GlobalConfig => ({
      ...global,
      hooks: {
        ...global.hooks,
        beforeOperation: [
          ...(global.hooks?.beforeOperation ?? []),
          async ({ operation, req }) => {
            if (isWriteOperation(operation) && getUserRole(req) === 'frontend') {
              throw new APIError('Frontend-role users cannot perform write operations', 403)
            }
          },
        ],
      },
    })

    return {
      ...incomingConfig,
      collections: (incomingConfig.collections ?? []).map(withFrontendReadOnly),
      globals: (incomingConfig.globals ?? []).map(withGlobalReadOnly),
    }
  }

import type { BaseFilter, Where } from 'payload'

import { GENERATED_ASSET_FLAGS } from './index'

/**
 * Query parameter selecting which assets the media list shows.
 * Absent means `uploaded` — the default the admin panel opens with.
 */
export const MEDIA_SCOPE_PARAM = 'scope'

export const MediaScope = {
  Uploaded: 'uploaded',
  Generated: 'generated',
  All: 'all',
} as const

export type MediaScope = (typeof MediaScope)[keyof typeof MediaScope]

const isMediaScope = (value: unknown): value is MediaScope =>
  typeof value === 'string' && Object.values(MediaScope).includes(value as MediaScope)

/**
 * Reads the requested scope, falling back to `uploaded`.
 */
export const resolveMediaScope = (value: unknown): MediaScope =>
  isMediaScope(value) ? value : MediaScope.Uploaded

/**
 * Builds the `generatorFlags` constraint for a given scope — the shared core
 * of `scopeMediaAssets` (Payload's server-side `admin.baseFilter`, which only
 * covers the List View and Lexical internal-link relationship fields) and any
 * custom picker that queries the media collections directly and needs the
 * exact same "Uploaded" definition (see `SelectMediaDrawer`, which fetches
 * via `usePayloadAPI` rather than through a Payload-native relationship
 * field, so `baseFilter` never runs for it).
 *
 * Machine-generated assets carry at least one flag from `GENERATED_ASSET_FLAGS`
 * (a subset of `GENERATOR_FLAGS` — see its doc comment for what's excluded and
 * why) and hand-uploaded ones carry none, so the two scopes are the presence or
 * absence of any of those flags. A document can still carry a flag outside that
 * subset (e.g. `unsplash-import`) without moving into the "Generated" scope.
 */
export const buildMediaScopeWhere = (scope: MediaScope): Where | null => {
  if (scope === MediaScope.All) return null

  return {
    generatorFlags: {
      [scope === MediaScope.Generated ? 'in' : 'not_in']: [
        ...GENERATED_ASSET_FLAGS,
      ],
    },
  }
}

/**
 * Scopes the media collections to hand-uploaded assets, task-generated ones, or
 * everything.
 *
 * Applies to the list view *and* to relationship pickers and Lexical internal
 * links — generated thumbnails are no more wanted in a link picker than in the
 * list, which is what makes this preferable to a query preset.
 */
export const scopeMediaAssets: BaseFilter = ({ req }) =>
  buildMediaScopeWhere(resolveMediaScope(req.query?.[MEDIA_SCOPE_PARAM]))

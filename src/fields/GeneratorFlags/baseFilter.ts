import type { BaseFilter, Where } from 'payload'

import { GENERATOR_FLAGS } from './index'

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
 * Scopes the media collections to hand-uploaded assets, task-generated ones, or
 * everything.
 *
 * Generated assets always carry at least one `generatorFlags` entry and
 * hand-uploaded ones carry none, so the two scopes are the presence or absence
 * of any known flag.
 *
 * Applies to the list view *and* to relationship pickers and Lexical internal
 * links — generated thumbnails are no more wanted in a link picker than in the
 * list, which is what makes this preferable to a query preset.
 */
export const scopeMediaAssets: BaseFilter = ({ req }) => {
  const scope = resolveMediaScope(req.query?.[MEDIA_SCOPE_PARAM])

  if (scope === MediaScope.All) return null

  const flags: Where = {
    generatorFlags: {
      [scope === MediaScope.Generated ? 'in' : 'not_in']: [
        ...GENERATOR_FLAGS,
      ],
    },
  }

  return flags
}

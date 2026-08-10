import type { BaseFilter } from 'payload'

import { GENERATOR_FLAGS } from './index'

/**
 * Query parameter that opts back into seeing generated assets, e.g.
 * `/admin/collections/images?showGenerated=true`.
 */
export const SHOW_GENERATED_PARAM = 'showGenerated'

/**
 * Hides task-generated assets — resume PDFs and the thumbnails derived from
 * them — from the media collections.
 *
 * Generated assets always carry at least one `generatorFlags` entry and
 * hand-uploaded ones carry none, so excluding every known flag leaves exactly
 * the manually uploaded files.
 *
 * Applies to the list view *and* to relationship pickers and Lexical internal
 * links, which is what makes this preferable to a query preset: generated
 * thumbnails are no more wanted in a link picker than in the list.
 *
 * Pass `?showGenerated=true` to see everything, for the occasional case of
 * debugging a generated thumbnail.
 */
export const hideGeneratedAssets: BaseFilter = ({ req }) => {
  if (req.query?.[SHOW_GENERATED_PARAM] === 'true') return null

  return {
    generatorFlags: {
      not_in: [
        ...GENERATOR_FLAGS,
      ],
    },
  }
}

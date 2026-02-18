import type { BlockData } from '@custom-types'
import type { Page } from '@payload-types'
import type { CollectionBeforeValidateHook } from 'payload'

import { getFilteredBlocks } from '../utils/getFilteredBlocks'

export const removeInvalidBlockData =
  (fieldName: string): CollectionBeforeValidateHook<Page> =>
  ({ data }) => ({
    ...data,
    block: data[fieldName]?.filter(({ blockType }: BlockData) => getFilteredBlocks(data).includes(blockType)),
  })

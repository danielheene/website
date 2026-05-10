import type { BlockData } from '@/types/blocks'
import type { Page } from '@/types/payload'
import type { CollectionBeforeValidateHook } from 'payload'

import { getFilteredBlocks } from '../utils/getFilteredBlocks'

export const removeInvalidBlockData =
  (fieldName: string): CollectionBeforeValidateHook<Page> =>
  ({ data }) => ({
    ...data,
    block: data[fieldName]?.filter(({ blockType }: BlockData) => getFilteredBlocks(data).includes(blockType)),
  })

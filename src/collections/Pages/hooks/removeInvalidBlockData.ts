import { CollectionBeforeValidateHook } from 'payload'
import { Page } from '@payload-types'
import { BlockData } from '@custom-types'
import { getFilteredBlocks } from '../utils/getFilteredBlocks'

export const removeInvalidBlockData =
  (fieldName: string): CollectionBeforeValidateHook<Page> =>
  ({ data }) => ({
    ...data,
    block: data[fieldName]?.filter(({ blockType }: BlockData) => getFilteredBlocks(data).includes(blockType)),
  })

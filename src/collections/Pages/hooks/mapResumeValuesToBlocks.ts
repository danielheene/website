import { CollectionBeforeReadHook } from 'payload'
import { BlockData } from '@custom-types'
import { Page } from '@payload-types'
import { camelCase, upperFirst } from 'lodash-es'
import { GLOBAL_SLUGS } from '@/globals'

export const mapResumeValuesToBlocks =
  (blockField: string): CollectionBeforeReadHook<Page> =>
  async ({ doc, req }) => {
    if (!doc[blockField]) return doc
    if (!Array.isArray(doc[blockField])) return doc

    doc[blockField] = await doc[blockField].reduce(async (blocks: Promise<BlockData[]>, block: BlockData) => {
      const isResumeBlock = block.blockType.startsWith('Resume') || block.blockType.startsWith('resume-')

      if (isResumeBlock) {
        const slug = GLOBAL_SLUGS.find((s) => block.blockType.includes(upperFirst(camelCase(s))))

        const data = await req.payload.findGlobal({
          slug,
          depth: 2,
        })
        return [...((await blocks) || []), { ...block, data }]
      }

      return [...((await blocks) || []), { ...block }]
    }, [])

    return doc
  }

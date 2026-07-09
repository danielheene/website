import type { CollectionBeforeChangeHook } from 'payload'
import { sha256 } from 'hash-wasm'


export const generateChecksum: CollectionBeforeChangeHook = async ({ data, req: { file }, context }) => {
  if (context.skipGenerateAlt) return data

  /* req.file is only set when uploading a file */
  if (!file || !file?.mimetype?.includes('image')) return data

  const buffer = Buffer.from(file.data)
  const hash = await sha256(buffer)

  console.log(hash)

  return { ...data,  }
}

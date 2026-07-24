import type { CollectionBeforeChangeHook } from 'payload'

import { sha256 } from 'hash-wasm'

/**
 * Generates and attaches a SHA-256 checksum from an uploaded file.
 */
export const generateChecksum: CollectionBeforeChangeHook = async ({
  data,
  req,
  context,
  operation,
}) => {
  if (context.skipGenerateChecksum) return data

  let checksum: string
  if ((operation === 'create' || operation === 'update') && req.file) {
    checksum = await sha256(Buffer.from(req.file.data))
  }

  return {
    ...data,
    checksum,
  }
}

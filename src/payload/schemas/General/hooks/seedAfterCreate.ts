import { CollectionAfterChangeHook } from 'payload'

type SeedResponse =
  | {
      success: true
      error: never
    }
  | {
      success: false
      error: string
    }

export const seedAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  req: { payload, data = {} },
  operation,
}) => {
  const { totalDocs: existingUsers } = await payload.count({ collection: 'users' })

  if (operation === 'create' && existingUsers === 1 && req.user) {
    try {
      const { success, error }: SeedResponse = await fetch(new URL('/api/seed', req.url)).then(
        (res) => res.json(),
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      req.payload.logger.error(message)
    }
  }

  return doc
}

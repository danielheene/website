import { CollectionAfterChangeHook } from 'payload'

export const loginAfterCreate: CollectionAfterChangeHook = async ({
  doc,
  req,
  req: { payload, data = {} },
  operation,
}) => {
  const { totalDocs: existingUsers } = await payload.count({ collection: 'users' })
  if (operation === 'create' && !req.user && existingUsers === 1) {
    const { email, password } = data as { email: string; password: string }

    if (email && password) {
      const { user, token } = await payload.login({
        collection: 'users',
        data: { email, password },
        req,
      })

      return {
        ...doc,
        token,
        user,
      }
    }
  }

  return doc
}

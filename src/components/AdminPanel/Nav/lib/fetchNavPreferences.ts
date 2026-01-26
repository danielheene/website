import type { NavPreferences, Payload, TypedUser } from 'payload'

import { cache } from 'react'

export const fetchNavPreerencess = cache(
  async ({ payload, user }: { payload: Payload; user?: TypedUser }): Promise<NavPreferences | null> =>
    user
      ? await payload
          .find({
            collection: 'payload-preferences',
            depth: 0,
            limit: 1,
            user,
            where: {
              and: [
                {
                  key: {
                    equals: 'nav',
                  },
                },
                {
                  'user.relationTo': {
                    equals: user.collection,
                  },
                },
                {
                  'user.value': {
                    equals: user.id,
                  },
                },
              ],
            },
          })
          ?.then((res) => res?.docs?.[0]?.value as NavPreferences)
      : null,
)

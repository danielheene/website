import { CollectionAfterLoginHook } from 'payload'
import * as process from 'node:process'
import { differenceInHours } from 'date-fns'

type SeedResponse =
  | {
      success: true
      error: never
    }
  | {
      success: false
      error: string
    }

export const seedAfterLogin: CollectionAfterLoginHook = async ({ req, user }) => {
  const { docs: users } = await req.payload.find({ collection: 'users' })
  if (
    users.length === 1 &&
    users[0].email === user.email &&
    differenceInHours(Date.now(), Date.parse(users[0].createdAt))
  ) {
    try {
      const { success, error } = await fetch(
        new URL('/api/seed', process.env.PAYLOAD_PUBLIC_SERVER_URL),
        {
          headers: {
            Authorization: `JWT ${user.token}`,
          },
        },
      ).then((res) => res.json() as Promise<SeedResponse>)

      if (success) req.payload.logger.info('Seeding data was successful.')
      if (error) req.payload.logger.error(error)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      req.payload.logger.error(error, message)
    }
  }
}

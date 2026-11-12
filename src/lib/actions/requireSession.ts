import { headers } from 'next/headers'
import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Rejects a Server Action call that carries no signed-in Payload session.
 *
 * A Server Action is its own reachable endpoint, whichever page renders the
 * control that calls it, so every action that costs money or changes data
 * checks the session itself instead of relying on the admin panel's routing.
 */
export const requireSession = async (): Promise<void> => {
  const payload = await getPayload({
    config,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user) {
    throw new Error('You must be signed in to do this.')
  }
}

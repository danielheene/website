import { connection } from 'next/server'

import { readRuntimeConfigFromEnv } from '@/lib/runtimeConfig'

/**
 * Serves the runtime config to pages that cannot embed it in their HTML,
 * chiefly the generated Payload admin layout. Values are public by design.
 */
export async function GET() {
  await connection()

  return Response.json(readRuntimeConfigFromEnv(), {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

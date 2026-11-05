import { connection } from 'next/server'

export async function GET() {
  await connection()

  return Response.json(
    {
      ok: true,
    },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      },
    },
  )
}

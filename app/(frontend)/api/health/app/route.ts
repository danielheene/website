import { connection } from 'next/server'

export async function GET() {
  await connection()

  return Response.json(
    {
      ok: true,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

export async function GET() {
  return Response.json(
    {
      ok: true,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}

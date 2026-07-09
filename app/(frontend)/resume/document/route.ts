import { NextRequest, NextResponse } from 'next/server'

/**
 * Redirects to the latest version of the resume document when no id is provided.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  return NextResponse.redirect(new URL(`${url.pathname}/latest`, url))
}

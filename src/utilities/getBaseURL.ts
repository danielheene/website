export const getBaseURL = async (): Promise<URL> => {
  // Client
  if (typeof window !== 'undefined') {
    return new URL('/', window.location.origin)
  }

  // Server
  try {
    const { headers } = await import('next/headers')
    const headersObj = Object.fromEntries(await headers())
    return new URL(headersObj['x-forwarded-proto'] + '://' + headersObj['x-forwarded-host'])
  } catch {
    /* empty */
  }

  // Fallback for SSG, you may use a custom env instead (Solution no. 2)
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'develop') {
    return new URL('https://daniel.heene.dev')
  }
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'main') {
    return new URL('https://daniel.heene.io')
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return new URL(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
  }
  return new URL(`http://localhost:3000`)
}

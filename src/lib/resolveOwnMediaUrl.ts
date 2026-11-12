/**
 * Resolves a media URL against this site and rejects anything that points
 * elsewhere, so a server-side fetch of "our own upload" can never be steered
 * to another host. Uploads are served from `/api/<collection>/file/...`, so a
 * legitimate value is always same-origin.
 */
export const resolveOwnMediaUrl = (url: string | null | undefined): URL => {
  if (!url) {
    throw new Error('The image has no URL yet.')
  }

  const origin = new URL(process.env.SERVER_URL ?? '').origin
  const resolved = new URL(url, origin)

  if (resolved.origin !== origin) {
    throw new Error(`Refusing to fetch media from another origin: ${resolved.origin}`)
  }

  return resolved
}

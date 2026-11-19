/** Open Graph image route; Payload already owns `/api/og` for the admin. */
export const OG_IMAGE_PATH = '/api/og-image'

export const OG_SIZE = {
  width: 1200,
  height: 630,
}

// JPEG keeps photo backgrounds around 150 KB; PNG ran to about 1 MB, more than
// some link previews accept.
export const OG_CONTENT_TYPE = 'image/jpeg'

import sharp from 'sharp'

// the leaf modules, not `@/components/Icon`: that barrel re-exports the `'use client'` Icon, so
// on the server these names would resolve to client reference stubs
import { ICON } from '@/components/Icon/aliases'
import { ICONIFY_API } from '@/components/Icon/api'

// a full Iconify name; the Icon field may also store a house alias, resolved first
const ICON_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/

const ALIASES = new Map<string, string>(Object.entries(ICON))

const HEX_COLOR = /^[0-9a-f]{6}$/i

// emails show the icons at 20px; four times that stays sharp on high-density screens
const SIZE = 80

// the self-hosted Iconify ignores `?height=` and `?color=`: its SVGs are `1em` (12px to sharp at
// its default 72 DPI) and drawn in `currentColor`, so both are applied here
const SVG_EM_PX = 12

/**
 * An Iconify icon as a PNG, for emails: clients show neither SVG nor icon fonts, and the social
 * links come from content (Referenced Profiles), so the set of icons isn't known at build time.
 *
 * `GET /api/icons/png?icon=simple-icons:github&color=0A0A0A` (or `?icon=github`, an alias)
 */
export const GET = async (request: Request): Promise<Response> => {
  const params = new URL(request.url).searchParams
  const requested = params.get('icon') ?? ''
  const icon = ALIASES.get(requested) ?? requested
  const color = params.get('color') ?? '000000'

  if (!icon || !ICON_NAME.test(icon) || !HEX_COLOR.test(color)) {
    return Response.json(
      {
        error: 'Expected ?icon=<prefix>:<name> or an alias, and an optional ?color=<6-digit hex>',
      },
      {
        status: 400,
      },
    )
  }

  const [prefix, name] = icon.split(':')

  try {
    const response = await fetch(`${ICONIFY_API}/${prefix}/${name}.svg`)

    if (!response.ok) {
      return Response.json(
        {
          error: 'Unknown icon',
        },
        {
          status: 404,
        },
      )
    }

    const svg = (await response.text()).replaceAll('currentColor', `#${color}`)

    // rasterised at the target size rather than scaled up, so the edges stay crisp
    const png = await sharp(Buffer.from(svg), {
      density: (72 * SIZE) / SVG_EM_PX,
    })
      .resize({
        height: SIZE,
      })
      .png()
      .toBuffer()

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        // an icon at a given name and color doesn't change; a week bounds a redeployed icon set
        'Cache-Control': 'public, max-age=604800',
      },
    })
  } catch (caught) {
    console.error('Icon PNG failed:', caught)

    return Response.json(
      {
        error: 'Icon PNG failed',
      },
      {
        status: 502,
      },
    )
  }
}

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { cn } from 'tailwind-variants'
import { Renderer } from 'takumi-js/node'
import { ImageResponse } from 'takumi-js/response'

import { LOGO_INLINE } from '@/components/Logo/logoPaths'

import { OG_SIZE } from './constants'

// `--primary`, oklch(0.462 0.282 266.79): Takumi needs it as plain sRGB.
const PRIMARY = '#1d27f2'

const SANS = 'PP Supply Sans'
const FRAMA = 'PP Frama'
const MONO = 'PP Supply Mono'

let rendererPromise: Promise<Renderer> | undefined

/**
 * One renderer per process with the brand fonts registered once. The paths
 * stay literal so Next's output tracing ships the font files.
 */
const getRenderer = (): Promise<Renderer> => {
  rendererPromise ??= (async () => {
    const renderer = new Renderer()

    const [sans, mono, frama] = await Promise.all([
      readFile(join(process.cwd(), 'public/fonts/pp-supply-sans/pp-supply-sans-500.ttf')),
      readFile(join(process.cwd(), 'public/fonts/pp-supply-mono/pp-supply-mono-400.ttf')),
      readFile(join(process.cwd(), 'public/fonts/pp-frama/pp-frama-400-normal.ttf')),
    ])

    await renderer.registerFont({
      name: SANS,
      data: sans,
      weight: 500,
    })
    await renderer.registerFont({
      name: MONO,
      data: mono,
      weight: 400,
    })
    await renderer.registerFont({
      name: FRAMA,
      data: frama,
      weight: 400,
    })

    return renderer
  })()

  return rendererPromise
}

const LOGO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_INLINE.width} ${LOGO_INLINE.height}" fill="#fff"><path d="${LOGO_INLINE.bar}"/><path d="${LOGO_INLINE.mark}"/></svg>`,
)}`

const LOGO_HEIGHT = 36

// Long titles step down so they still fit in three lines.
const titleSize = (title: string) => {
  if (title.length <= 32) return 68

  if (title.length <= 64) return 56

  return 46
}

export interface OgTopic {
  title: string
  /** The post's primary topic, set apart from the rest. */
  primary?: boolean
}

export interface OgImageProps {
  title: string
  /** The page's meta description, under the title in at most two lines. */
  description?: string | null
  /** A small label above the title, e.g. "Resume". Ignored when `topics` are given. */
  eyebrow?: string
  /** Rendered as badges above the title. */
  topics?: OgTopic[]
  /** Absolute URL of the still behind the duotone; brand blue alone without one. */
  background?: string
}

/**
 * The shared Open Graph card: the background in the site's duotone (greyscale
 * lightened with brand blue, like `DuoTone`), the logo and site address on
 * top, and the title with its label or topics at the bottom.
 */
export const renderOgImage = async ({
  title,
  description,
  eyebrow,
  topics = [],
  background,
}: OgImageProps): Promise<ImageResponse> => {
  const renderer = await getRenderer()
  const siteUrl = process.env.SERVER_URL.replace(/\/$/, '')
  const fontSize = titleSize(title)

  return new ImageResponse(
    <div
      tw="relative flex h-full w-full flex-col justify-between p-16 text-white"
      style={{
        backgroundColor: PRIMARY,
        fontFamily: SANS,
      }}
    >
      {background && (
        // oxlint-disable-next-line nextjs/no-img-element -- Takumi renders plain elements, not next/image
        <img
          alt=""
          src={background}
          tw="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: 'grayscale(100%)',
          }}
        />
      )}
      <div
        tw="absolute inset-0"
        style={{
          backgroundColor: PRIMARY,
          mixBlendMode: 'lighten',
        }}
      />
      {/* Brand-blue scrims keep the white logo and title readable on bright areas. */}
      <div
        tw="absolute inset-x-0 top-0 h-56"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${PRIMARY}b3, ${PRIMARY}00)`,
        }}
      />
      <div
        tw="absolute inset-x-0 bottom-0 h-96"
        style={{
          backgroundImage: `linear-gradient(to top, ${PRIMARY}e6, ${PRIMARY}00)`,
        }}
      />

      <div tw="relative flex items-center justify-between">
        {/* oxlint-disable-next-line nextjs/no-img-element -- Takumi renders plain elements, not next/image */}
        <img
          alt=""
          src={LOGO_SRC}
          style={{
            height: LOGO_HEIGHT,
            width: (LOGO_HEIGHT * LOGO_INLINE.width) / LOGO_INLINE.height,
          }}
        />
        <span
          tw="text-2xl"
          style={{
            fontFamily: MONO,
          }}
        >
          {siteUrl}
        </span>
      </div>

      <div tw="relative flex flex-col items-start">
        {topics.length > 0 ? (
          <div tw="mb-6 flex flex-wrap gap-3">
            {topics.map(({ title: topic, primary }) => (
              <span
                key={topic}
                tw={cn([
                  'border-2 border-white px-4 py-1.5 text-xl uppercase',
                  primary ? 'bg-white' : 'bg-transparent',
                ])}
                style={{
                  fontFamily: MONO,
                  color: primary ? PRIMARY : '#fff',
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        ) : (
          eyebrow && (
            <span
              tw="mb-5 text-2xl uppercase"
              style={{
                fontFamily: MONO,
              }}
            >
              {eyebrow}
            </span>
          )
        )}
        <h1
          tw="m-0 max-w-5xl"
          style={{
            fontSize,
            lineHeight: 1.1,
            fontWeight: 500,
            lineClamp: 3,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            tw="m-0 mt-5 max-w-4xl text-[26px]"
            style={{
              fontFamily: FRAMA,
              lineHeight: 1.35,
              lineClamp: 2,
              opacity: 0.9,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>,
    {
      ...OG_SIZE,
      format: 'jpeg',
      quality: 85,
      renderer,
    },
  )
}

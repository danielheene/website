'use client'

import { useState } from 'react'

export interface HeroVideoPlayerProps {
  src: string
  poster?: string | null
  blurDataURL?: string | null
  loop?: boolean
}

/**
 * Single-video hero player with a blur → poster → video reveal sequence.
 *
 * The blur placeholder (base64 data URI) appears immediately; the poster
 * image loads on top of it; once the video fires `canplay` both fade out and
 * the video fades in, then plays.
 */
export const HeroVideoPlayer = ({
  src,
  poster,
  blurDataURL,
  loop = true,
}: HeroVideoPlayerProps) => {
  const [videoReady, setVideoReady] = useState(false)

  return (
    <>
      {blurDataURL && (
        // biome-ignore lint/performance/noImgElement: base64 data URI, not optimisable
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          src={blurDataURL}
          style={{
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
      )}
      {poster && (
        // biome-ignore lint/performance/noImgElement: needs inline opacity transition
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          src={poster}
          style={{
            opacity: videoReady ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
      )}
      <video
        autoPlay
        className="h-full w-full object-cover"
        loop={loop}
        muted
        onCanPlay={() => setVideoReady(true)}
        playsInline
        preload="auto"
        src={src}
        style={{
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 600ms ease',
        }}
      />
    </>
  )
}

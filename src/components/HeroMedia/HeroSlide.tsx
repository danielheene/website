'use client'

import { useEffect, useRef, useState } from 'react'

import { ImageMedia } from '@/components/ImageMedia'

import { ShaderHeroBackground } from './ShaderHeroBackground'
import type { ShaderPresetKey } from './shaderPresets'

export type HeroMediaItem =
  | {
      kind: 'image'
      id: string
      url: string
      alt: string
      blurDataURL?: string | null
    }
  | {
      kind: 'video'
      id: string
      url: string
      alt: string
      poster?: string | null
      blurDataURL?: string | null
    }
  | {
      kind: 'shader'
      id: string
      presetKey: ShaderPresetKey
    }

export interface HeroSlideProps {
  item: HeroMediaItem
  index: number
  isActive: boolean
  priority: boolean
  /** Set when this is the only slide, so a video has nothing to hand over to. */
  loop?: boolean
  onHandoff: (index: number) => void
}

export const HeroSlide = ({
  index,
  isActive,
  item,
  loop = false,
  onHandoff,
  priority,
}: HeroSlideProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  /**
   * Tracks whether the video has buffered enough to begin playing. Starts
   * false so the poster/blur layer is visible until `canplay` fires, at which
   * point we fade the video in and hide the placeholder.
   */
  const [videoReady, setVideoReady] = useState(false)

  // Reset ready state when the slide goes off-screen so the next activation
  // starts with the placeholder visible again.
  useEffect(() => {
    if (item.kind !== 'video') return
    if (!isActive) setVideoReady(false)
  }, [isActive, item.kind])

  /**
   * Restart a video whenever its slide becomes active, and pause it when it
   * leaves — otherwise off-screen slides keep decoding frames.
   *
   * `play()` rejects when autoplay is blocked (iOS low-power mode, for
   * instance). The slide must not stall the carousel in that case, so a
   * rejection hands over immediately and the video is treated as a still.
   */
  useEffect(() => {
    const video = videoRef.current
    if (item.kind !== 'video' || !video) return

    if (!isActive) {
      video.pause()
      return
    }

    video.currentTime = 0
    const played = video.play()

    played?.catch(() => {
      onHandoff(index)
    })
  }, [index, isActive, item.kind, onHandoff])

  /**
   * Fires `onHandoff` when the video ends so the full clip plays before the
   * next slide fades in. `ended` is the sole trigger — no early hand-off.
   */
  useEffect(() => {
    const video = videoRef.current
    if (item.kind !== 'video' || !video || !isActive) return
    // A looping video never hands over, so it needs no end-of-play watcher.
    if (loop) return

    const onEnded = () => onHandoff(index)

    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('ended', onEnded)
    }
  }, [index, isActive, item.kind, loop, onHandoff])

  return (
    <div aria-hidden={!isActive} className="relative h-full w-full shrink-0 grow-0 basis-full">
      {item.kind === 'image' ? (
        <ImageMedia
          alt={item.alt}
          blurDataURL={item.blurDataURL}
          className="object-cover"
          fill
          priority={priority}
          sizes="100vw"
          url={item.url}
        />
      ) : item.kind === 'video' ? (
        <>
          {/* Blur placeholder: base64 data URI — not optimisable by next/image. */}
          {item.blurDataURL && (
            // oxlint-disable-next-line nextjs/no-img-element -- base64 data URI, not a URL
            <img
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              src={item.blurDataURL}
              style={{
                opacity: videoReady ? 0 : 1,
                transition: 'opacity 600ms ease',
              }}
            />
          )}
          {/* Poster image: full-res thumbnail fades out once the video can play. */}
          {item.poster && (
            // oxlint-disable-next-line nextjs/no-img-element -- needs inline opacity transition
            <img
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              src={item.poster}
              style={{
                opacity: videoReady ? 0 : 1,
                transition: 'opacity 600ms ease',
              }}
            />
          )}
          <video
            className="h-full w-full object-cover"
            controls={false}
            loop={loop}
            muted
            onCanPlay={() => setVideoReady(true)}
            playsInline
            preload={priority ? 'auto' : 'metadata'}
            ref={videoRef}
            src={item.url}
            style={{
              opacity: videoReady ? 1 : 0,
              transition: 'opacity 600ms ease',
            }}
          />
        </>
      ) : (
        <ShaderHeroBackground className="h-full w-full" presetKey={item.presetKey} />
      )}
    </div>
  )
}

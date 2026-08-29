'use client'

import { useEffect, useRef } from 'react'

import { ImageMedia } from '@/components/ImageMedia'

const toSafeMediaUrl = (value: string): string | undefined => {
  try {
    const parsed = new URL(value, window.location.origin)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return undefined
  }

  return undefined
}

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
    }

export interface HeroSlideProps {
  item: HeroMediaItem
  index: number
  isActive: boolean
  priority: boolean
  fadeMs: number
  /** Set when this is the only slide, so a video has nothing to hand over to. */
  loop?: boolean
  onHandoff: (index: number) => void
}

export const HeroSlide = ({
  fadeMs,
  index,
  isActive,
  item,
  loop = false,
  onHandoff,
  priority,
}: HeroSlideProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

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
  }, [
    index,
    isActive,
    item.kind,
    onHandoff,
  ])

  /**
   * Starts the cross-fade `fadeMs` before the video ends, so it is still
   * playing as the next slide fades up.
   *
   * `timeupdate` fires every ~250ms, which is coarse but well inside the fade
   * window. `ended` is a backstop for videos shorter than the fade and for
   * browsers that stop firing `timeupdate` near the end.
   */
  useEffect(() => {
    const video = videoRef.current
    if (item.kind !== 'video' || !video || !isActive) return
    // A looping video never hands over, so it needs no end-of-play watcher.
    if (loop) return

    const fadeSeconds = fadeMs / 1000

    const onTimeUpdate = () => {
      const { currentTime, duration } = video
      if (!Number.isFinite(duration) || duration <= 0) return

      if (currentTime >= duration - fadeSeconds) {
        onHandoff(index)
      }
    }

    const onEnded = () => onHandoff(index)

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [
    fadeMs,
    index,
    isActive,
    item.kind,
    loop,
    onHandoff,
  ])

  const safeUrl = toSafeMediaUrl(item.url)

  return (
    <div aria-hidden={!isActive} className="relative h-full w-full shrink-0 grow-0 basis-full">
      {item.kind === 'image' ? (
        safeUrl ? (
          <ImageMedia
            alt={item.alt}
            blurDataURL={item.blurDataURL}
            className="object-cover"
            fill
            priority={priority}
            sizes="100vw"
            url={safeUrl}
          />
        ) : null
      ) : (
        <video
          className="h-full w-full object-cover"
          controls={false}
          loop={loop}
          muted
          playsInline
          poster={item.poster ?? undefined}
          preload={priority ? 'auto' : 'metadata'}
          ref={videoRef}
          src={safeUrl}
        />
      )}
    </div>
  )
}

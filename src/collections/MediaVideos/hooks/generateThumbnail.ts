import type { CollectionAfterChangeHook } from 'payload'

import { registerMediabunnyServer } from '@mediabunny/server'
import { createCanvas } from '@napi-rs/canvas'
import { millisecondsToSeconds } from 'date-fns'
import { ALL_FORMATS, BufferSource, Input, VideoSample, VideoSampleSink } from 'mediabunny'

import { CollectionSlug } from '@/types/collections'
import { MediaVideo } from '@/types/payload'

let registered = false

if (!registered) {
  registerMediabunnyServer()
  registered = true
}

export const generateThumbnail: CollectionAfterChangeHook<MediaVideo> = async ({
  data,
  doc,
  req: { file, payload },
}) => {
  if (!file?.mimetype?.includes('video')) return data

  const sample = await extractThumbnail({
    data: file.data,
    timestampInSeconds: millisecondsToSeconds(200),
  })

  const width = sample.displayWidth
  const height = sample.displayHeight

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  await sample.copyTo(imageData.data, {
    format: 'RGBA',
  })
  ctx.putImageData(imageData, 0, 0)
  sample.close()

  // ctx.createImageData(width, height)
  const canvasBuffer = canvas.toBuffer('image/png')
  const thumbnail = await payload.create({
    collection: CollectionSlug.MediaImages,
    file: {
      data: canvasBuffer,
      mimetype: 'image/png',
      name: file.name.replace(/\.[^.]+$/, '.png'),
      size: canvasBuffer.byteLength,
    },
    data: {
      width,
      height,
      generatorFlags: [
        '+thumbnail',
      ],
    },
  })

  await payload.update({
    collection: CollectionSlug.MediaVideos,
    id: doc.id,
    data: {
      thumbnails: [
        {
          relationTo: CollectionSlug.MediaImages,
          value: thumbnail.id,
        },
      ],
    },
  })
}

export type ExtractThumbnailProps = {
  data: Buffer
  timestampInSeconds: number
  signal?: AbortSignal
}

export async function extractThumbnail({
  data,
  timestampInSeconds,
  signal,
}: ExtractThumbnailProps): Promise<VideoSample> {
  using input = new Input({
    formats: ALL_FORMATS,
    source: new BufferSource(data),
  })

  const videoTrack = await input.getPrimaryVideoTrack()
  if (!videoTrack) {
    throw new Error('No video track found in the input')
  }
  if (signal?.aborted) {
    throw new Error('Aborted')
  }

  const sink = new VideoSampleSink(videoTrack)
  const sample = await sink.getSample(timestampInSeconds)

  if (!sample) {
    throw new Error(`No frame found at timestamp ${timestampInSeconds}s`)
  }

  return sample
}

import type { TaskHandler } from 'payload'

import { registerMediabunnyServer } from '@mediabunny/server'
import { createCanvas } from '@napi-rs/canvas'
import { isString } from 'lodash-es'
import { ALL_FORMATS, BufferSource, Input, type VideoSample, VideoSampleSink } from 'mediabunny'

import type { GeneratorFlag } from '@/fields/GeneratorFlags'
import { wrapHandler } from '@/jobs-queue/lib/withJobObservability'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

let registered = false

if (!registered) {
  registerMediabunnyServer()
  registered = true
}

export type ExtractThumbnailProps = {
  data: Buffer
  timestampInSeconds: number
  signal?: AbortSignal
}

/** Decodes a single frame of `data` at the given timestamp. */
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

/** Renders a decoded video frame to a PNG buffer. */
const sampleToPng = async (sample: VideoSample) => {
  const width = sample.displayWidth
  const height = sample.displayHeight

  const canvas = createCanvas(width, height)
  const context = canvas.getContext('2d')
  const imageData = context.createImageData(width, height)

  await sample.copyTo(imageData.data, {
    format: 'RGBA',
  })
  context.putImageData(imageData, 0, 0)
  sample.close()

  return {
    width,
    height,
    buffer: canvas.toBuffer('image/png'),
  }
}

const run: TaskHandler<TaskSlug['GenerateVideoThumbnails']> = async ({
  input: { videoId, timestampInSeconds },
  req: { payload },
}) => {
  const video = await payload.findByID({
    collection: CollectionSlug.MediaVideos,
    id: videoId,
    showHiddenFields: true,
    select: {
      id: true,
      url: true,
      filename: true,
      thumbnails: true,
    },
  })

  // the upload lives in S3, so the frame is decoded from a fetched copy
  // rather than from req.file (unavailable outside the upload request)
  const response = await fetch(video.url)
  if (!response.ok) {
    throw new Error(`Failed to fetch video ${videoId}: HTTP ${response.status}`)
  }
  const data = Buffer.from(await response.arrayBuffer())

  const sample = await extractThumbnail({
    data,
    timestampInSeconds: timestampInSeconds ?? 0,
  })
  const { width, height, buffer } = await sampleToPng(sample)

  /* when creating thumbnails was successful, delete old ones */
  if (Array.isArray(video.thumbnails) && video.thumbnails.length > 0) {
    for (const { relationTo, value } of video.thumbnails) {
      await payload.delete({
        collection: relationTo,
        id: isString(value) ? value : value.id,
      })
    }
  }

  const filenameBase = video?.filename?.replace(/\.[^/.]+$/, '')
  const { id } = await payload.create({
    collection: CollectionSlug.MediaImages,
    data: {
      width,
      height,
      generatorFlags: [
        'video-thumbnail',
        'thumbnail',
      ] as GeneratorFlag[],
    },
    file: {
      data: buffer,
      name: `${filenameBase}-thumbnail.png`,
      mimetype: 'image/png',
      size: buffer.byteLength,
    },
  })

  await payload.update({
    collection: CollectionSlug.MediaVideos,
    id: videoId,
    data: {
      thumbnails: [
        {
          relationTo: CollectionSlug.MediaImages,
          value: id,
        },
      ],
    },
    context: {
      skipGenerateVideoThumbnails: true,
    },
  })

  return {
    output: {
      thumbnailIDs: [
        id,
      ],
    },
  }
}

export const handler = wrapHandler(TaskSlug.GenerateVideoThumbnails, run)

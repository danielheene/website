import type { TaskHandler } from 'payload'

import { registerMediabunnyServer } from '@mediabunny/server'
import { createCanvas } from '@napi-rs/canvas'
import { ALL_FORMATS, BufferSource, Input, type VideoSample, VideoSampleSink } from 'mediabunny'

import type { GeneratorFlag } from '@/fields/GeneratorFlags'
import {
  deleteThumbnails,
  stripExtension,
  toMediaImageRelations,
} from '@/jobs-queue/lib/thumbnails'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

registerMediabunnyServer()

type ExtractThumbnailProps = {
  data: Buffer
  timestampInSeconds: number
}

/** Decodes a single frame of `data` at the given timestamp. */
const extractThumbnail = async ({
  data,
  timestampInSeconds,
}: ExtractThumbnailProps): Promise<VideoSample> => {
  using input = new Input({
    formats: ALL_FORMATS,
    source: new BufferSource(data),
  })

  const videoTrack = await input.getPrimaryVideoTrack()
  if (!videoTrack) {
    throw new Error('No video track found in the input')
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

  return {
    width,
    height,
    buffer: canvas.toBuffer('image/png'),
  }
}

/**
 * Decodes one frame of a video and attaches it as its thumbnail.
 *
 * Like `generateDocumentThumbnails`, the old thumbnail is deleted before
 * the new one is created: `MediaVideos`' `adminThumbnail` builds its
 * preview URL from a fixed filename pattern, so the new file must land on
 * that exact name. The delete is best-effort so a failure there can't
 * block regeneration.
 */
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

  // The upload lives in S3, so the frame is decoded from a fetched copy
  // rather than from req.file (unavailable outside the upload request).
  const response = await fetch(video.url)
  if (!response.ok) {
    throw new Error(`Failed to fetch video ${videoId}: HTTP ${response.status}`)
  }
  const data = Buffer.from(await response.arrayBuffer())

  const sample = await extractThumbnail({
    data,
    timestampInSeconds: timestampInSeconds ?? 0,
  })
  const { width, height, buffer } = await sampleToPng(sample).finally(() => sample.close())

  // Deleted before creating the replacement: `adminThumbnail` on this
  // collection builds the preview URL from a fixed filename pattern
  // (`<filename>-thumbnail.png`), so the new thumbnail must land on that
  // exact name rather than whatever `getSafeFileName` renames it to if
  // the old file is still there. Best-effort — a failed delete must not
  // block regenerating the thumbnail.
  if (Array.isArray(video.thumbnails) && video.thumbnails.length > 0) {
    try {
      await deleteThumbnails(payload, video.thumbnails)
    } catch (error) {
      payload.logger.error(`Failed to delete old video thumbnail: ${error}`)
    }
  }

  const filenameBase = stripExtension(video.filename ?? String(videoId))
  const { id } = await payload.create({
    collection: CollectionSlug.MediaImages,
    data: {
      width,
      height,
      generatorFlags: ['video-thumbnail', 'thumbnail'] satisfies GeneratorFlag[],
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
      thumbnails: toMediaImageRelations([id]),
    },
    context: {
      skipGenerateVideoThumbnails: true,
    },
  })

  return {
    output: {
      thumbnailIDs: [id],
    },
  }
}

export const handler = run

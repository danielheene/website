import type { Payload, TaskHandler } from 'payload'

import {
  fetchUploadOriginal,
  loadLatestDocument,
  latestWriteOptions,
} from '@/jobs-queue/lib/documentTaskHandler'
import { fetchAnthropicImageAltText } from '@/lib/anthropic/fetchImageAltText'
import { createBlurDataURL } from '@/lib/createBlurDataURL'
import { resolveDocumentTaskSteps } from '@/lib/documentTasks/definitions'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

// A Claude outage costs only the alt text: sizes and blur are still saved, and the step can be rerun
const generateAlt = async (
  payload: Payload,
  data: Buffer,
  filename: string,
): Promise<string | null> => {
  try {
    return await fetchAnthropicImageAltText(data)
  } catch (error) {
    payload.logger.error({ err: error, msg: `processImage: alt text for ${filename} failed` })

    return null
  }
}

/**
 * Works from the stored original. Sizes can only be rebuilt by uploading the original again,
 * which Payload then resizes; blur and alt text are computed here and saved alongside.
 */
const run: TaskHandler<TaskSlug['ProcessImage']> = async ({ input, req: { payload } }) => {
  const steps = resolveDocumentTaskSteps(TaskSlug.ProcessImage, input.steps)
  const image = await loadLatestDocument(payload, CollectionSlug.MediaImages, input.id)

  if (!image?.filename) return { output: { updated: false } }

  const { data, contentType } = await fetchUploadOriginal(image.url)

  const blurDataURL = steps.has('blur') ? await createBlurDataURL(data) : null
  const alt = steps.has('alt') ? await generateAlt(payload, data, image.filename) : null

  await payload.update({
    ...latestWriteOptions(payload, TaskSlug.ProcessImage, CollectionSlug.MediaImages, image),
    collection: CollectionSlug.MediaImages,
    data: {
      ...(blurDataURL && { blurDataURL }),
      ...(alt && { alt }),
    },
    ...(steps.has('sizes') && {
      file: {
        data,
        mimetype: image.mimeType ?? contentType ?? 'image/jpeg',
        name: image.filename,
        size: data.length,
      },
      // the same file under the same name: replace it and its sizes instead of adding a `-1` copy
      overwriteExistingFiles: true,
    }),
  })

  return { output: { updated: true } }
}

export const handler = run

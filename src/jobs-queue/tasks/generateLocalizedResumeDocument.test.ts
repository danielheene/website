import { describe, expect, it, vi } from 'vitest'

import { generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'

// The config's `handler` is typed as `string | TaskHandler<...>` to also allow
// referencing a handler by import-map path; it's always the function itself here.
// biome-ignore lint/suspicious/noExplicitAny: narrowing the string|TaskHandler union for tests
const handler = generateLocalizedResumeDocument.handler as (args: any) => Promise<any>

const makePayloadStub = () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
})

const makeInput = () => ({
  locale: 'en' as const,
  sharedId: 'nanoid-1',
  filenameTemplate: 'resume-{nanoid}',
  createdAt: '2026-01-01T00:00:00.000Z',
  documentSlug: 'resume-slug',
})

describe('generateLocalizedResumeDocument', () => {
  it("threads each step's output into the next step's input, in order", async () => {
    const payload = makePayloadStub()

    const tasks = {
      GenerateResumeFilename: vi.fn(async () => ({
        filename: 'resume-en',
      })),
      BuildLocalizedResumeData: vi.fn(async () => ({
        resumeDocumentData: {
          document: {
            title: 'Resume',
          },
        },
      })),
      GenerateResumeFile: vi.fn(async () => ({
        resumeFileId: 'file-1',
        resumeFileChecksum: 'checksum-1',
      })),
      GenerateDocumentThumbnails: vi.fn(async () => ({
        thumbnailIDs: [
          'thumb-1',
          'thumb-2',
        ],
      })),
    }

    const result = await handler({
      // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's TaskHandlerArgs
      tasks: tasks as any,
      input: makeInput(),
      req: {
        payload,
        // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's req
      } as any,
      // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's TaskHandlerArgs
    } as any)

    expect(tasks.GenerateResumeFilename).toHaveBeenCalledWith(
      'GenerateFilename:en',
      expect.objectContaining({
        input: expect.objectContaining({
          filenameTemplate: 'resume-{nanoid}',
          sharedId: 'nanoid-1',
          locale: 'en',
        }),
      }),
    )
    expect(tasks.BuildLocalizedResumeData).toHaveBeenCalledWith(
      'BuildResumeData:en',
      expect.objectContaining({
        input: expect.objectContaining({
          locale: 'en',
          filename: 'resume-en',
          documentSlug: 'resume-slug',
        }),
      }),
    )
    expect(tasks.GenerateResumeFile).toHaveBeenCalledWith(
      'BuildResumeFile:en',
      expect.objectContaining({
        input: expect.objectContaining({
          filename: 'resume-en',
          resumeDocumentData: {
            document: {
              title: 'Resume',
            },
          },
        }),
      }),
    )
    expect(tasks.GenerateDocumentThumbnails).toHaveBeenCalledWith(
      'BuildResumeThumbnails:en',
      expect.objectContaining({
        input: expect.objectContaining({
          documentId: 'file-1',
        }),
      }),
    )

    expect(result).toEqual({
      output: {
        resumeFileId: 'file-1',
        resumeFileChecksum: 'checksum-1',
        resumeThumbnailIds: [
          'thumb-1',
          'thumb-2',
        ],
        resumeDocumentData: {
          document: {
            title: 'Resume',
          },
        },
      },
    })
  })

  it('logs the raw stack and rethrows when a step fails', async () => {
    const payload = makePayloadStub()
    const failure = new Error('boom')

    const tasks = {
      GenerateResumeFilename: vi.fn(async () => {
        throw failure
      }),
      BuildLocalizedResumeData: vi.fn(),
      GenerateResumeFile: vi.fn(),
      GenerateDocumentThumbnails: vi.fn(),
    }

    await expect(
      handler({
        // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's TaskHandlerArgs
        tasks: tasks as any,
        input: makeInput(),
        req: {
          payload,
          // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's req
        } as any,
        // biome-ignore lint/suspicious/noExplicitAny: mocked subset of Payload's TaskHandlerArgs
      } as any),
    ).rejects.toThrow('boom')

    expect(payload.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('RAW ERROR STACK [GenerateResumeFilename:en]'),
    )
    expect(tasks.BuildLocalizedResumeData).not.toHaveBeenCalled()
  })
})

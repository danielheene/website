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
  customId: 'CUSTOMID1',
  filenameTemplate: 'resume-{nanoid}',
  createdAt: '2026-01-01T00:00:00.000Z',
  documentSlug: 'resume-slug',
})

describe('generateLocalizedResumeDocument', () => {
  it("threads each step's output into the next step's input, in order", async () => {
    const payload = makePayloadStub()

    const tasks = {
      generateResumeFilename: vi.fn(async () => ({
        filename: 'resume-en',
      })),
      buildLocalizedResumeData: vi.fn(async () => ({
        resumeDocumentData: {
          document: {
            title: 'Resume',
          },
        },
      })),
      generateResumeFile: vi.fn(async () => ({
        resumeFileId: 'file-1',
        resumeFileChecksum: 'checksum-1',
      })),
      generateDocumentThumbnails: vi.fn(async () => ({
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

    expect(tasks.generateResumeFilename).toHaveBeenCalledWith(
      'GenerateFilename:en',
      expect.objectContaining({
        input: expect.objectContaining({
          filenameTemplate: 'resume-{nanoid}',
          customId: 'CUSTOMID1',
          locale: 'en',
        }),
      }),
    )
    expect(tasks.buildLocalizedResumeData).toHaveBeenCalledWith(
      'BuildResumeData:en',
      expect.objectContaining({
        input: expect.objectContaining({
          locale: 'en',
          filename: 'resume-en',
          documentSlug: 'resume-slug',
        }),
      }),
    )
    expect(tasks.generateResumeFile).toHaveBeenCalledWith(
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
    expect(tasks.generateDocumentThumbnails).toHaveBeenCalledWith(
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

  it('propagates a step failure and does not run later steps', async () => {
    const payload = makePayloadStub()
    const failure = new Error('boom')

    const tasks = {
      generateResumeFilename: vi.fn(async () => {
        throw failure
      }),
      buildLocalizedResumeData: vi.fn(),
      generateResumeFile: vi.fn(),
      generateDocumentThumbnails: vi.fn(),
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

    expect(tasks.buildLocalizedResumeData).not.toHaveBeenCalled()
    expect(tasks.generateResumeFile).not.toHaveBeenCalled()
    expect(tasks.generateDocumentThumbnails).not.toHaveBeenCalled()
  })
})

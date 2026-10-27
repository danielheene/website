import { describe, expect, it, vi } from 'vitest'

import { handler as generateLocalizedResumeDocument } from './generateLocalizedResumeDocument'

// oxlint-disable-next-line typescript/no-explicit-any -- the mocked args are a subset of TaskHandlerArgs
const handler = generateLocalizedResumeDocument as (args: any) => Promise<any>

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
        thumbnailIDs: ['thumb-1', 'thumb-2'],
      })),
    }

    const result = await handler({
      job: {
        id: 'job-1',
      },
      // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's TaskHandlerArgs
      tasks: tasks as any,
      input: makeInput(),
      req: {
        payload,
        // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's req
      } as any,
      // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's TaskHandlerArgs
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
          documentSlug: 'resume-slug',
        }),
      }),
    )
    // oxlint-disable-next-line typescript/no-explicit-any -- mock.calls args are typed from the zero-arg stub above
    expect((tasks.buildLocalizedResumeData.mock.calls[0] as any)[1].input).not.toHaveProperty(
      'filename',
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
    // oxlint-disable-next-line typescript/no-explicit-any -- mock.calls args are typed from the zero-arg stub above
    expect((tasks.generateResumeFile.mock.calls[0] as any)[1].input).not.toHaveProperty('locale')
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
        resumeThumbnailIds: ['thumb-1', 'thumb-2'],
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
        job: {
          id: 'job-1',
        },
        // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's TaskHandlerArgs
        tasks: tasks as any,
        input: makeInput(),
        req: {
          payload,
          // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's req
        } as any,
        // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's TaskHandlerArgs
      } as any),
    ).rejects.toThrow('boom')

    expect(tasks.buildLocalizedResumeData).not.toHaveBeenCalled()
    expect(tasks.generateResumeFile).not.toHaveBeenCalled()
    expect(tasks.generateDocumentThumbnails).not.toHaveBeenCalled()
  })
})

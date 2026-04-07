import { CollectionSlug, GlobalSlug } from '@custom-types'
import type { MediaDocument } from '@payload-types'
import { renderToBuffer } from '@react-pdf/renderer'
import type { Data, File, TaskConfig } from 'payload'

import { generateUniqueResumeDocumentName } from '@/lib/generateUniqueResumeDocumentName'
import { getResumeDocumentData } from '@/lib/getResumeDocumentData'
import { ResumeDocument } from '@/pdfs/ResumeDocument'
import { extractErrorMessage } from '@/utilities/extractErrorMessage'

export const generateResumeDocumentTask: TaskConfig<'generateResumeDocumentTask'> = {
  slug: 'generateResumeDocumentTask',
  label: 'Generate Resume Document',
  retries: 3,
  concurrency: {
    key: ({ input }) => `generate:resume:document:${input.locale}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({ input, req }) => {
    'use server'

    const locale = input?.locale === 'de' ? 'de' : 'en'

    const documentData = await getResumeDocumentData(locale)
    console.info(`fetched document data for locale: ${locale}`)
    const fileName = generateUniqueResumeDocumentName({ authorName: documentData?.userMetaData?.name, locale })
    console.info(`generated unique document name: ${fileName}`)
    // const fileStream: ReadableStream = await ReactPDF.renderToStream(<ResumeDocument {...documentData} />)
    const arrayBufferLike = await renderToBuffer(<ResumeDocument {...documentData} />)
    const fileBuffer = Buffer.from(arrayBufferLike)
    // const fileBuffer = Buffer.from(await new Response(fileStream).arrayBuffer())
    console.info(`generated resume document file buffer`)

    let document: MediaDocument

    console.info(`Checking for existing resume document for locale: ${locale}`)
    let existingDocument: MediaDocument | null = null
    const documentDownload = documentData?.downloads?.documents?.[locale]
    if (typeof documentDownload === 'object' && 'id' in documentDownload) {
      existingDocument = documentDownload
    } else if (typeof documentDownload === 'string' && documentDownload !== '') {
      existingDocument = await req.payload.findByID({
        collection: CollectionSlug.MediaDocuments,
        id: documentDownload,
      })
    }

    console.log('filename:', fileName)
    const data: Data = {
      thumbnail: null,
    }

    const file: File = {
      data: fileBuffer,
      name: fileName,
      mimetype: 'application/pdf',
      size: fileBuffer.byteLength,
    }

    try {
      if (existingDocument) {
        console.info(`Existing resume document found for locale: ${locale}`)
        document = await req.payload.update({
          collection: CollectionSlug.MediaDocuments,
          id: existingDocument.id,
          data,
          file,
          overwriteExistingFiles: true,
        })
        console.info(`Updated resume document for locale: ${locale}`)
      } else {
        console.info(`No existing resume document found for locale: ${locale}, creating new one`)
        document = await req.payload.create({
          collection: CollectionSlug.MediaDocuments,
          data,
          file,
        })
        console.info(`Created resume document for locale: ${locale}`)

        await req.payload.updateGlobal({
          slug: GlobalSlug.ResumeDownloads,
          data: {
            documents: {
              [locale]: document.id,
            },
          },
          locale: 'all',
          context: { skipRevalidate: true },
        })
      }
    } catch (error) {
      console.error(`Failed to create or update resume document: ${fileName}:\n${extractErrorMessage(error)}`, error)
      console.debug(`data: ${JSON.stringify(error.data, null, 2)}`)
      console.debug(`data: ${JSON.stringify(error.cause, null, 2)}`)
      console.log(
        'docs',
        JSON.stringify(await req.payload.find({ collection: CollectionSlug.MediaDocuments, select: { filename: true } }), null, 2),
      )
      throw error
    }

    return { output: {} }
  },
}

export default generateResumeDocumentTask

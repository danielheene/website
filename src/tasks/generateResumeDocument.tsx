import { TaskConfig } from 'payload'
import { getResumeDocumentData } from '@/lib/getResumeDocumentData'
import React from 'react'
import { ResumeDocument } from '@/pdfs/ResumeDocument'
import { CollectionSlug } from '@custom-types'

import * as ReactPDF from '@react-pdf/renderer'
import { MediaDocument } from '@payload-types'
import { logger } from '@/lib/otel/logger'
import { generateUniqueResumeDocumentName } from '@/lib/generateUniqueResumeDocumentName'


export const generateResumeDocument: TaskConfig<'generateResumeDocument'> = {
  slug: 'generateResumeDocument',
  label: 'Generate Resume Documents',
  retries: 3,
  concurrency: {
    key: ({ input }) => `generate:resume:${input.locale}`,
    exclusive: true,
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'en',
    },
  ],
  outputSchema: [
    {
      name: 'documentID',
      type: 'text',
    },
  ],
  handler: async ({ input, req }) => {
    'use server'

    const locale = input.locale === 'de' ? 'de' : 'en'

    logger.info(`Generating Resume Document for locale: ${locale}`)

    let documentData: Awaited<ReturnType<typeof getResumeDocumentData>>
    try {
      documentData = await getResumeDocumentData(locale)
      logger.info(`Fetched resume document data for locale: ${locale}`)
    } catch (error) {
      logger.error(`Failed to fetch cached resume document data for locale: ${locale}`, error)
      throw error
    }

    let fileBuffer: Buffer
    try {
      fileBuffer = await ReactPDF.renderToBuffer(<ResumeDocument {...documentData} />)
      logger.info(`Rendered resume document for locale: ${locale}`)
    } catch (error) {
      logger.error(`Failed to render Resume Document for locale: ${locale}`, error)
      throw error
    }
    //
    // const filename = `resume_${locale}.pdf`
    // const detailedName = ['resume', data?.userMetaData?.name, locale, formatDate(new Date(), 'yyyyMMdd'), id]
    //   .filter(Boolean)
    //   .join(' ')
    //   .replace(/\s+/g, '_')
    //   .toLowerCase() + '.pdf'
    //

    // let thumbnailDoc: MediaImage
    // try {
    //   const parser = new PDFParse({ data: fileBuffer })
    //   const result = await parser.getScreenshot({ first: 1 })
    //
    //   thumbnailDoc = await req.payload.create({
    //     collection: CollectionSlug.MediaImages,
    //     locale,
    //     data: {
    //       filename: detailedName.replace('.pdf', '.png'),
    //       width: result.pages[0].width,
    //       height: result.pages[0].height,
    //     },
    //     file: {
    //       data: Buffer.from(result.pages[0].data),
    //       name: detailedName.replace('.pdf', '.png'),
    //       mimetype: 'image/png',
    //       size: result.pages[0].data.byteLength,
    //     },
    //     req: { transactionID },
    //   })
    //   logger.info(`Generated thumbnail for resume document for locale: ${locale}`, context)
    // } catch (error) {
    //   logger.error(`Failed to generate thumbnail for resume document for locale: ${locale}`, error, context)
    // }

    let document: MediaDocument
    const docSlug = `document:resume:${locale}`
    const filename = generateUniqueResumeDocumentName({ authorName: documentData?.userMetaData?.name, locale })

    const data = {
      filename: `${filename}.pdf`,
      documentKey: docSlug,
    }

    const file = {
      data: fileBuffer,
      name: `${filename}.pdf`,
      mimetype: 'application/pdf',
      size: fileBuffer.byteLength,
    }

    const { docs: [existingDoc] } = await req.payload.find({
      collection: CollectionSlug.MediaDocuments,
      depth: 10,
      limit: 1,
      pagination: false,
      locale,
      where: {
        slug: {
          equals: docSlug,
        },
      },
    })

    try {
      if (existingDoc) {
        document = await req.payload.update({
          collection: CollectionSlug.MediaDocuments,
          id: existingDoc.id,
          data,
          file,
          overwriteExistingFiles: true,
        })
      } else {
        document = await req.payload.create({
          collection: CollectionSlug.MediaDocuments,
          data,
          file,
        })
      }
      logger.info(`Created or updated resume document for locale: ${locale}`)
    } catch (error) {
      logger.error(`Failed to create or update resume document for locale: ${locale}`, error)
      throw error
    }

    logger.info(`Committing transaction for resume document for locale: ${locale}`)

    return {
      output: {
        documentID: document.id,
      },
    }
  },
}

export default generateResumeDocument


import type { Data, File, TaskConfig } from 'payload'

import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

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
    //
    // const documentData = await getResumeDocumentData(locale)
    // const userData = documentData?.globalUserSettings
    //
    // console.info(`fetched document data for locale: ${locale}`)
    // const fileName = generateUniqueResumeDocumentName({
    //   authorName: documentData?.globalUserSettings?.name,
    //   locale,
    // })
    // console.info(`generated unique document name: ${fileName}`)
    // // const fileStream: ReadableStream = await ReactPDF.renderToStream(<ResumeDocument {...documentData} />)
    // const arrayBufferLike = await renderToBuffer(
    //   <ResumeDocument
    //     isPreview={false}
    //     locale={locale}
    //     document={{
    //       author: userData.name,
    //       title: 'Resume',
    //       language: 'English',
    //       fileName: fileName,
    //       fileId: '',
    //       creationDate: new Date(),
    //       serverUrl: process.env.SERVER_URL,
    //     }}
    //     {...documentData}
    //   />,
    // )
    // const fileBuffer = Buffer.from(arrayBufferLike)
    // const fileBuffer = Buffer.from(await new Response(fileStream).arrayBuffer())
    console.info(`generated resume document file buffer`)

    console.log('filename:', fileName)
    const data: Data = {
      thumbnail: null,
      generator: `resume:document:${locale}`,
    }

    const file: File = {
      data: fileBuffer,
      name: fileName,
      mimetype: 'application/pdf',
      size: fileBuffer.byteLength,
    }

    const transactionID = await req.payload.db.beginTransaction()
    try {
      const document = await req.payload.create({
        collection: CollectionSlug['MediaDocuments'],
        data,
        file,
        req: {
          transactionID,
        },
      })

      await req.payload.updateGlobal({
        slug: GlobalSlug['ResumeDownloads'],
        data: {
          [`download_${locale}`]: document.id,
        },
        context: {
          skipRevalidate: true,
        },
        req: {
          transactionID,
        },
      })

      // await req.payload.update({
      //   collection: CollectionSlug['MediaDocuments'],
      //   where: {
      //     and: [
      //       {
      //         id: {
      //           not_equals: document.id,
      //         },
      //       },
      //       {
      //         generator: {
      //           equals: `resume:document:${locale}`,
      //         },
      //       },
      //     ],
      //   },
      //   data: {
      //     folder: {
      //       id: folder.id,
      //     },
      //   },
      //   showHiddenFields: true,
      //   req: {
      //     transactionID,
      //   },
      // })

      await req.payload.db.commitTransaction(transactionID)
    } catch (error) {
      await req.payload.db.rollbackTransaction(transactionID)
      throw error
    }

    return {
      output: {},
    }
  },
}

export default generateResumeDocumentTask

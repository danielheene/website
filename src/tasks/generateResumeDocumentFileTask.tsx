import { TaskConfig } from 'payload'
import * as ReactPdf from '@react-pdf/renderer'
import { ResumeDocument } from '@/pdfs/ResumeDocument'
import { logger } from '@/lib/otel/logger'
import { ComponentProps } from 'react'
import React from 'react'
import { generateContentURL } from '@/lib/generateContentURL'
import { ResumeDocumentData } from '@custom-types'

export const generateResumeDocumentFileTask: TaskConfig<'generateResumeDocumentFileTask'> = {
  slug: 'generateResumeDocumentFileTask',
  label: 'Generate Resume Document File',
  retries: 3,
  inputSchema: [
    {
      name: 'locale',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },

  ],
  outputSchema: [
    {
      name: 'b64File',
      type: 'text',
    },
  ],
  handler: async ({ input, job }) => {
    'use server'

    const locale = input.locale === 'de' ? 'de' : 'en'
    const data = input.data as ResumeDocumentData

    try {
      const fileBuffer = await ReactPdf.renderToBuffer(<ResumeDocument {...data} />)
      // const fileBuffer = await stream.toBuffer()
      // const url = generateContentURL({ path: '/download/resume.pdf', params: { locale } })
      // const fileBuffer = await fetch(url, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/pdf',
      //   },
      // }).then(response => response.toString())
      logger.info(`Rendered resume document for locale: ${locale}`, { locale })
      return { output: { b64File: fileBuffer.toString('base64') } }
    } catch (error) {
      logger.error(`Failed to render Resume Document for locale: ${locale}`, error, { locale })
      throw error
    }

  },
}

export default generateResumeDocumentFileTask

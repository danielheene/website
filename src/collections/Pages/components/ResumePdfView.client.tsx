'use client'

import { PDFViewer } from '@react-pdf/renderer'
import type { ComponentProps } from 'react'

import { ResumeDocument } from '@/pdfs/ResumeDocument'


export default function ResumePdfViewClientComponent(props: ComponentProps<typeof ResumeDocument>) {
  return (
    <PDFViewer
      showToolbar={true}
      style={{
        width: '100%',
        height: 'calc(100vh - var(--app-header-height) - var(--doc-controls-height))',
        border: 'none',
      }}
    >
      <ResumeDocument {...props} />
    </PDFViewer>
  )
}

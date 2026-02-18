'use client'

import { PDFViewer } from '@react-pdf/renderer'
import type { ComponentProps } from 'react'

import { ResumeDocument } from '@/pdfs/ResumeDocument'

type ResumePdfViewClientComponentProps = ComponentProps<typeof ResumeDocument>

export default function ResumePdfViewClientComponent(props: ResumePdfViewClientComponentProps) {
  return (
    <PDFViewer
      showToolbar={false}
      style={{ width: '100%', height: 'calc(100% - var(--app-header-height) - var(--doc-controls-height))', border: 'none' }}
    >
      <ResumeDocument {...props} />
    </PDFViewer>
  )
}

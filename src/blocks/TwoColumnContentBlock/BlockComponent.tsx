'use client'

import { RenderLexical } from '@payloadcms/richtext-lexical/client'
// @ts-expect-error
import type { LexicalRichTextField } from '@payloadcms/richtext-lexical/dist/types'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import type { BlocksFieldClientProps } from 'payload'
import { useRef } from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

const BlockComponent = ({ schemaPath }: BlocksFieldClientProps) => {
  const { collectionSlug } = useDocumentInfo()
  const documentType = collectionSlug ? 'collection' : 'global'
  const fieldPath = schemaPath.slice(0, schemaPath.lastIndexOf('.'))

  const leftField = useField<LexicalRichTextField>({ path: `${documentType}.${fieldPath}.left` })
  const rightField = useField<LexicalRichTextField>({ path: `${documentType}.${fieldPath}.right` })

  const containerRef = useRef<HTMLDivElement>(null)

  const onResize = useDebounceCallback(() => {
    if (containerRef.current) {
      const columEditors = Array.from(containerRef.current.querySelectorAll<HTMLDivElement>('.editor > [contenteditable]'))
      const newHeight = columEditors.map(({ scrollHeight }) => scrollHeight).reduce((acc, height) => (height > acc ? height : acc), 0)

      columEditors.map((node) => (node.style.minHeight = `${newHeight}px`))
    }
  }, 150)

  useResizeObserver({ ref: containerRef, onResize })

  return (
    <div ref={containerRef} className="grid grid-cols-12 gap-4">
      <div className="col-span-6">
        <RenderLexical
          schemaPath={leftField.path}
          path={leftField.path}
          initialValue={leftField.initialValue}
          field={{ name: 'left' }}
          value={leftField.value}
          setValue={leftField.setValue}
        />
      </div>
      <div className="col-span-6">
        <RenderLexical
          schemaPath={rightField.path}
          path={rightField.path}
          initialValue={rightField.initialValue}
          field={{ name: 'right' }}
          value={rightField.value}
          setValue={rightField.setValue}
        />
      </div>
    </div>
  )
}

export default BlockComponent

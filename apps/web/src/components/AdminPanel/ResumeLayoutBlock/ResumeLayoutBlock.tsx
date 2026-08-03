'use client'
import { Fragment, memo, useState } from 'react'
import { GroupFieldClientProps } from 'payload'
import { RenderFields } from '@payloadcms/ui'

import { cn } from '@/lib/cn'

export interface ResumeLayoutBlockProps extends GroupFieldClientProps {
  imageSrc: string
  editHref: string
  backgroundColor: 'primary' | 'default'
}

export const ResumeLayoutBlock = memo(
  ({
    imageSrc,
    backgroundColor = 'default',
    field,
    indexPath,
    path,
    schemaPath,
    permissions,
    readOnly,
    forceRender,
  }: ResumeLayoutBlockProps) => {
    const [imageReady, setImageReady] = useState<boolean>(false)
    const [showFields, setShowFields] = useState<boolean>(false)

    return (
      <div
        className={cn([
          'relative -m-(--base)',
          backgroundColor === 'default' && 'bg-white text-black',
          backgroundColor === 'primary' && 'bg-primary text-primary-foreground',
        ])}
      >
        <div
          className={cn([
            'relative flex justify-center align-center',
            'aspect-16-9 max-h-[500px] mx-auto overflow-hidden',
            showFields && 'overflow-y-scroll',
          ])}
        >
          {showFields ? (
            <div className="flex min-h-full min-w-full flex-col items-center justify-center p-10 opacity-0 animate-fade-in">
              <RenderFields
                className="w-full text-foreground"
                fields={field.fields}
                parentIndexPath={indexPath}
                parentPath={path}
                parentSchemaPath={schemaPath}
                permissions={permissions}
                forceRender={forceRender}
                readOnly={readOnly}
              />
            </div>
          ) : (
            <Fragment>
              {/** biome-ignore lint/performance/noImgElement: <used for payload blocks> */}
              <img
                className={cn([
                  'absolute w-full h-full object-contain opacity-0',
                  imageReady && 'animate-fade-in',
                ])}
                onLoad={() => setImageReady(true)}
                src={imageSrc}
                alt=""
              />
              <button
                type="button"
                className={cn([
                  'absolute bottom-4 left-1/2 -translate-x-1/2',
                  'm-0 py-2 px-4 font-mono text-inherit leading-none',
                  'bg-transparent hover:bg-current/10 border-none rounded-md',
                ])}
                onClick={() => setShowFields(true)}
              >
                Show Section Fields
              </button>
            </Fragment>
          )}
        </div>
      </div>
    )
  },
)

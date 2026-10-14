'use client'

import { Fragment, memo, useState } from 'react'
import { GroupFieldClientProps } from 'payload'
import { RenderFields } from '@payloadcms/ui'

import { cn } from 'tailwind-variants'

export interface FieldComponentProps extends GroupFieldClientProps {
  imageSrc: string
  variant: 'primary' | 'default'
}

export const FieldComponent = memo(
  ({
    imageSrc,
    variant = 'default',
    field,
    indexPath,
    path,
    schemaPath,
    permissions,
    readOnly,
    forceRender,
  }: FieldComponentProps) => {
    const [imageReady, setImageReady] = useState<boolean>(false)
    const [showFields, setShowFields] = useState<boolean>(false)

    return (
      <div
        className={cn([
          'relative -m-(--base)',
          variant === 'default' && 'bg-white text-black',
          variant === 'primary' && 'bg-primary text-primary-foreground',
        ])}
      >
        <div
          className={cn([
            'align-center relative mx-auto flex justify-center',
            !showFields && 'aspect-16-9 max-h-[500px] overflow-hidden',
            showFields && 'min-h-[500px] overflow-y-scroll',
          ])}
        >
          {showFields ? (
            <div className="my-10 flex min-h-full min-w-full animate-fade-in flex-col items-center justify-center p-10 opacity-0">
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
              {/** oxlint-disable-next-line nextjs/no-img-element -- used for payload blocks */}
              <img
                className={cn([
                  'absolute size-full object-contain opacity-0',
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
                  'm-0 px-4 py-2 font-mono leading-none text-inherit',
                  'rounded-md border-none',
                  variant === 'default' &&
                    'hover:bg-primary-accent bg-primary text-primary-foreground',
                  variant === 'primary' && 'bg-white text-primary hover:bg-neutral-300',
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

export default FieldComponent

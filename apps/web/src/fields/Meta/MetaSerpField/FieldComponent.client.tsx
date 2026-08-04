'use client'

import type { CSSProperties } from 'react'
import type { UIFieldClientProps } from 'payload'
import { useField } from '@payloadcms/ui'

import { cn } from '@repo/utils/cn'

type FieldComponentClientProps = {
  pageUrl?: string
  faviconUrl?: string
  siteName?: string
} & UIFieldClientProps

export const FieldComponentClient = ({
  pageUrl,
  faviconUrl,
  siteName,
  field,
  path,
}: FieldComponentClientProps) => {
  const { value: title } = useField<string>({
    path: path.replace(field.name, 'title'),
  })
  const { value: description } = useField<string>({
    path: path.replace(field.name, 'description'),
  })

  return (
    <section
      className={cn([
        'serp-section',
        'overflow-hidden',
        'mt-10',
        'mb-16',
        'ml-auto',
        'mr-auto',
        'w-fit',
        'border',
        'border-border',
        'rounded-(--input-rounded)',
        'bg-(--input-color-back)',
        'p-4',
      ])}
      style={
        {
          '--serp-favicon-background': `light-dark(#f1f3f4, #fff)`,
          '--serp-favicon-border': `light-dark(#ecedef, #5c5f5e)`,
          '--serp-site-name-font': `Google Sans, Arial, sans-serif`,
          '--serp-site-name-font-size': `14px`,
          '--serp-site-name-line-height': `20px`,
          '--serp-site-name-color': `light-dark(#4d5156, #bfbfbf)`,
          '--serp-page-url-font': `Google Sans, Arial, sans-serif`,
          '--serp-page-url-font-size': `12px`,
          '--serp-page-url-line-height': `18px`,
          '--serp-page-url-color': `light-dark(#4d5156, #bfbfbf)`,
          '--serp-title-font': `Google Sans, Arial, sans-serif`,
          '--serp-title-font-size': `22px`,
          '--serp-title-line-height': `28px`,
          '--serp-title-color': `light-dark(#1a0dab, #99c3ff)`,
          '--serp-description-font': `Google Sans, Arial, sans-serif`,
          '--serp-description-font-size': `14px`,
          '--serp-description-line-height': `22px`,
          '--serp-description-color': `light-dark(#4d5156, #bfbfbf)`,
        } as CSSProperties
      }
    >
      <div
        className={cn([
          'w-fit',
          'group/serp',
        ])}
      >
        <div className="flex justify-start items-center gap-3 w-fit">
          {faviconUrl && (
            <div
              className={cn([
                'inline-flex',
                'aspect-square',
                'h-[28px]',
                'w-[28px]',
                'items-center',
                'justify-center',
                'rounded-full',
                'border',
                'border-solid',
                'border-(--serp-favicon-border)',
                'bg-(--serp-favicon-background)',
                'overflow-hidden',
              ])}
            >
              {/** biome-ignore lint/performance/noImgElement: <explanation> */}
              <img className="block aspect-square h-full w-full" src={faviconUrl} alt="" />
            </div>
          )}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: 'var(--serp-site-name-font)',
                fontSize: 'var(--serp-site-name-font-size)',
                lineHeight: 'var(--serp-site-name-line-height)',
                color: 'var(--serp-site-name-color)',
              }}
              className={cn([
                'line-clamp-1',
                'w-[400px]',
                'lg:w-[600px]',
                'overflow-hidden',
              ])}
            >
              {siteName}
            </span>
            <span
              style={{
                fontFamily: 'var(--serp-page-url-font)',
                fontSize: 'var(--serp-page-url-font-size)',
                lineHeight: 'var(--serp-page-url-line-height)',
                color: 'var(--serp-page-url-color)',
              }}
              className={cn([
                'line-clamp-1',
                'w-[400px]',
                'lg:w-[600px]',
                'overflow-hidden',
              ])}
            >
              {pageUrl}
            </span>
          </div>
        </div>

        <h3
          style={{
            fontFamily: 'var(--serp-title-font)',
            fontSize: 'var(--serp-title-font-size)',
            lineHeight: 'var(--serp-title-line-height)',
            color: 'var(--serp-title-color)',
          }}
          className={cn([
            'mt-[3px]',
            'pt-[5px]',
            'line-clamp-1',
            'w-[540px]',
            'lg:w-[600px]',
            'overflow-hidden',
            'group-hover/serp:underline',
          ])}
        >
          {title}
        </h3>
      </div>
      <p
        style={{
          fontFamily: 'var(--serp-description-font)',
          fontSize: 'var(--serp-description-font-size)',
          lineHeight: 'var(--serp-description-line-height)',
          color: 'var(--serp-description-color)',
          height: 'calc(var(--serp-description-line-height) * 2)',
        }}
        className={cn([
          'line-clamp-2',
          'w-[680px]',
          'lg:w-[920px]',
          'overflow-hidden',
        ])}
      >
        {description}
      </p>
    </section>
  )
}

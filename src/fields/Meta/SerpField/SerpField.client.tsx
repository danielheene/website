'use client'

import { useField, useFieldPath } from '@payloadcms/ui'
import type { CSSProperties } from 'react'

interface SerpFieldClientProps {
  pageUrl?: string
  faviconUrl?: string
  siteName?: string
}

export const SerpFieldClient = ({ pageUrl, faviconUrl, siteName }: SerpFieldClientProps) => {
  const fieldPath = useFieldPath()
  const { value: title } = useField<string>({ path: fieldPath.replace('serp', 'title') })
  const { value: description } = useField<string>({ path: fieldPath.replace('serp', 'description') })

  return (
    <section
      className="serp-section"
      style={
        {
          '--serp-favicon-background': `light-dark(#f1f3f4, #fff)`,
          '--serp-favicon-border': `light-dark(#ecedef, #5c5f5e)`,
          '--serp-color-title': `light-dark(#1a0dab, #99c3ff)`,
          '--serp-color-text': `light-dark(#4d5156, #bfbfbf)`,
        } as CSSProperties
      }
    >
      <div className="overflow-hidden rounded-(--input-rounded) bg-(--input-color-back) p-4">
        <div className="mb-2 flex justify-start items-center gap-3">
          {faviconUrl && (
            <div className="inline-flex aspect-square h-[26px] w-[26px] items-center justify-center rounded-full border border-solid border-(--serp-favicon-border) bg-(--serp-favicon-background) overflow-hidden">
              {/** biome-ignore lint/performance/noImgElement: <explanation> */}
              <img className="block aspect-square h-full w-full" src={faviconUrl} alt="" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm text-(--serp-color-text)">{siteName}</span>
            <span className="line-clamp-1 text-xs text-(--serp-color-text)">{pageUrl}</span>
          </div>
        </div>

        <h3 className="line-clamp-1 text-xl text-(--serp-color-title)">{title}</h3>

        <p v-show="description" className="mt-1 line-clamp-2 text-sm text-(--serp-color-text)">
          {description}
        </p>
      </div>
    </section>
  )
}

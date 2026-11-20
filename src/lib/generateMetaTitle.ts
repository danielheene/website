'use server'

import { fetchSiteSettings } from '@/lib/fetchers'
import { renderTemplateCore } from '@/lib/renderTemplate.core'

export const generateMetaTitle = async (title: string) => {
  // uncached on purpose: this runs in Payload field hooks (document save),
  // which may execute outside a Next request context (scripts, jobs queue)
  // where 'use cache' functions like fetchSiteSettingsCached throw
  const {
    general: { titleTemplate },
  } = await fetchSiteSettings()

  const { result, error } = await renderTemplateCore({ template: titleTemplate, data: { title } })

  if (error) {
    console.error(error)
  }

  // an unrenderable template falls back to the bare title rather than none
  return result ?? title
}

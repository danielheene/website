import { BlogCategory } from '@payload-types'
import { CollectionBeforeChangeHook } from 'payload'

export const generateBreadcrumbsPath: CollectionBeforeChangeHook<BlogCategory> = ({ data }) => {
  const { breadcrumbs = [] } = data
  return {
    ...data,
    breadcrumbsPath: breadcrumbs.map(({ label }) => label).join(' > '),
  }
}

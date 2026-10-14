import { UrlObject } from 'url'

import { generateContentURL } from '@/lib/generateContentURL'

import { resolveLinkTarget, CUSTOM_URL_SLUG } from './resolveLinkTarget'

type LinkDataParam = Parameters<typeof resolveLinkTarget>[0]

type ResolvedLinkProps = {
  href: string | UrlObject
  target?: string
  rel?: string
}

export const resolveLinkProps = (linkData: LinkDataParam): ResolvedLinkProps | undefined => {
  const target = resolveLinkTarget(linkData)
  if (!target) return undefined

  const href =
    target.relationTo === CUSTOM_URL_SLUG
      ? target.value
      : typeof target.value === 'object' && target.value.slug
        ? generateContentURL({
            collection: target.relationTo,
            slug: target.value.slug,
          })
        : null
  if (!href) return undefined

  return linkData.newTab
    ? {
        href,
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {
        href,
      }
}

import type { CreativeWorkLeaf, ImageObjectLeaf } from 'schema-dts'

import { jsonLdIds } from './ids'

export interface CreativeWorkData {
  siteUrl: string
  name: string
  description?: string
  /** The client or context the work was made for. */
  scope?: string | null
  /** The post that writes about the work. */
  url?: string
  image?: ImageObjectLeaf
}

/** A project the site owner made, e.g. one listed on the resume. */
export function generateCreativeWork(data: CreativeWorkData): CreativeWorkLeaf {
  const work: CreativeWorkLeaf = {
    '@type': 'CreativeWork',
    name: data.name,
    creator: {
      '@id': jsonLdIds(data.siteUrl).person,
    },
  }

  if (data.description) work.description = data.description

  if (data.scope) {
    work.funder = {
      '@type': 'Organization',
      name: data.scope,
    }
  }

  if (data.url) work.url = data.url

  if (data.image) work.image = data.image

  return work
}

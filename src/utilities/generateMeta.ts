import type { BlogCategory, BlogPost, BlogTag, Config, Media, Page } from '@payload-types'
import type { Metadata } from 'next'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    /* @ts-ignore */
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<BlogPost> | Partial<BlogCategory> | Partial<BlogTag> | null
}): Promise<Metadata> => {
  const { doc } = args
  /* @ts-ignore */
  const ogImage = getImageURL(doc?.meta?.image)

  /* @ts-ignore */
  const title = doc?.meta?.title ? doc?.meta?.title + ' | Payload Website Template' : 'Payload Website Template'

  return {
    /* @ts-ignore */
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      /* @ts-ignore */
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}

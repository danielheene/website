import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { fetchDocumentBySlug } from '@/lib/fetchers/fetchDocumentBySlug'
import { fetchPageBySlug } from '@/lib/fetchers/fetchPageBySlug'
import { fetchPostBySlug } from '@/lib/fetchers/fetchPostBySlug'
import { fetchPublishedTopicBySlug } from '@/lib/fetchers/fetchPublishedTopicBySlug'
import { resumeDocumentDescription } from '@/lib/resumeDocumentDescription'
import { CollectionSlug } from '@/types/collections'

import type { OgTarget } from './ogTarget'
import { type OgImageProps, renderOgImage } from './renderOgImage'
import { resolveOgBackground } from './resolveOgBackground'

interface SiteDefaults {
  /** `SiteSettings.general.fallbackOgBackground`, the background when a document has none. */
  slides: unknown
  /** The site description, the fallback for documents without a meta description. */
  description: string | null | undefined
  name: string | null | undefined
}

/**
 * What the card shows for a target, or null when its document doesn't exist.
 * Descriptions follow `generateMeta`: the document's meta description, else
 * the site's.
 */
const ogImageProps = async (target: OgTarget, site: SiteDefaults): Promise<OgImageProps | null> => {
  if ('listing' in target)
    return {
      title: 'Blog',
      description: site.description,
      background: resolveOgBackground(site.slides),
    }

  const { collection, slug } = target

  if (collection === CollectionSlug.Pages) {
    const page = await fetchPageBySlug({ slug })

    if (!page) return null

    return {
      // The home page introduces the site's owner rather than repeating its title.
      title: slug === 'home' ? (site.name ?? page.title) : (page.title ?? 'Page'),
      description: page.meta?.description || site.description,
      background: resolveOgBackground(page.hero?.slides, site.slides),
    }
  }

  if (collection === CollectionSlug.BlogPosts) {
    const post = await fetchPostBySlug({ slug })

    if (!post) return null

    // Topics are a polymorphic relation; only populated entries carry a title.
    // The first is the primary one, as on the post page.
    const topics = (post.topics ?? [])
      .flatMap(({ value }) => (typeof value === 'object' && value?.title ? [value.title] : []))
      .map((title, index) => ({
        title,
        primary: index === 0,
      }))

    return {
      title: post.title ?? 'Blog post',
      description: post.meta?.description || site.description,
      topics,
      background: resolveOgBackground(post.hero?.slides, site.slides),
    }
  }

  if (collection === CollectionSlug.BlogTopics) {
    const topic = await fetchPublishedTopicBySlug(slug)

    if (!topic) return null

    return {
      eyebrow: 'Blog',
      title: topic.title,
      description: topic.meta?.description || site.description,
      background: resolveOgBackground(topic.hero?.slides, site.slides),
    }
  }

  const resume = await fetchDocumentBySlug({ slug })

  if (!resume) return null

  // Resume documents have no hero, so they always use the site default.
  return {
    eyebrow: 'Resume',
    title: resume.title ?? 'Resume',
    description: resumeDocumentDescription(resume.createdAt, site.name),
    background: resolveOgBackground(site.slides),
  }
}

/** Renders the Open Graph image for a target, or null when it doesn't exist. */
export const renderOgImageForTarget = async (target: OgTarget) => {
  const [
    {
      general: { fallbackOgBackground, description },
    },
    { name },
  ] = await Promise.all([fetchSiteSettingsCached(), fetchGlobalUserSettingsCached()])

  const props = await ogImageProps(target, {
    slides: fallbackOgBackground,
    description,
    name,
  })

  return props ? renderOgImage(props) : null
}

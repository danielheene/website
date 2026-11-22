import { type JSX, Suspense } from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { renderServerBlocks } from '@/blocks/renderServerBlocks'
import { ArticleSidebar, TableOfContents } from '@/components/ArticleSidebar'
import { LinkList } from '@/components/ArticleSidebar/LinkList'
import { RichText } from '@/components/RichText'
import { extractHeadings } from '@/lib/extractHeadings'
import { highlightRichText } from '@/lib/shiki/highlightRichText'
import type { LinkGroupData } from '@/types/payload'

export interface ArticleLayoutProps {
  /** The document's `content` rich text — `BlogPost.content` or `Page.content`. */
  content?: DefaultTypedEditorState | null
  /** The document's `links`, listed in the sidebar. */
  links?: LinkGroupData | null
  emptyMessage?: string
}

/**
 * Rich-text column with a sticky sidebar holding the table of contents and
 * links. Shared by blog posts and pages with the RichText Content layout.
 */
export const ArticleLayout = async ({
  content,
  links,
  emptyMessage = 'There is no content yet.',
}: ArticleLayoutProps): Promise<JSX.Element> => {
  const headings = extractHeadings(content)
  // Shiki and the data-fetching blocks are server-only; both are resolved here
  // and handed to RichText, which renders on the client
  const highlightedCode = await highlightRichText(content)
  const renderedBlocks = renderServerBlocks(content)

  return (
    <div className="container pt-20 pb-32">
      <div className="grid w-full items-start gap-16 lg:grid-cols-12">
        {/* scroll-mt keeps TOC anchor targets clear of the fixed header */}
        <article className="min-w-0 lg:col-span-8 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
          {content ? (
            // RichText is a Client Component that calls randomUUID(), which
            // Cache Components requires to sit behind a Suspense boundary
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
              <RichText
                data={content}
                enableGutter={false}
                highlightedCode={highlightedCode}
                renderedBlocks={renderedBlocks}
              />
            </Suspense>
          ) : (
            <p className="text-muted-foreground">{emptyMessage}</p>
          )}
        </article>

        <ArticleSidebar
          className="w-auto lg:col-span-4"
          sections={[
            headings.length > 0 && {
              title: 'On This Page',
              children: <TableOfContents headings={headings} />,
            },
            links &&
              links.length > 0 && {
                title: 'Links',
                children: <LinkList links={links} />,
              },
          ].filter(Boolean)}
        />
      </div>
    </div>
  )
}

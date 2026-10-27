'use client'

// import { MediaBlock } from '@/blocks/MediaBlock/Component'

import type { HTMLAttributes } from 'react'
import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
  LinkJSXConverter,
  ListJSXConverter,
} from '@payloadcms/richtext-lexical/react'

import { ImageMedia } from '@website/app-components/ImageMedia/index'
import { VideoMedia } from '@website/app-components/VideoMedia/index'
import { generateContentURL } from '@website/lib/generateContentURL'
import { generateSlug } from '@website/lib/generateSlug'
import { codeBlockKey, type HighlightedCodeMap } from '@website/lib/shiki/codeBlockKey'
import { type BlockData, BlockSlug } from '@website/types/blocks'
import { CollectionSlug } from '@website/types/collections'
import { cn } from 'tailwind-variants'

// import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
// import type { BannerBlock as BannerBlockProps, CallToActionBlock as CTABlockProps, MediaBlock as MediaBlockProps } from '@/payload-types'
// import { BannerBlock } from '@/blocks/Banner/Component'
// import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlockShell } from '@/blocks/CodeBlock/Renderer/CodeBlockShell'
import { HighlightBox } from '@/blocks/HighlightBoxBlock/Renderer/HighlightBox'
import { LinkGroupBlockRenderer } from '@/blocks/LinkGroupBlock/Renderer'
import { Columns } from '@/blocks/TwoColumnContentBlock/Renderer/Columns'
import { Icon } from '@/components/Icon'

import { linkConverter } from './linkConverter'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<BlockData>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!

  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }

  return generateContentURL({
    collection: relationTo,
    slug: value.slug as string,
  })
}

const buildJsxConverters =
  (highlightedCode: HighlightedCodeMap): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => {
    /**
     * Heading ids are assigned in document order with the same slug +
     * de-duplication rules as `extractHeadings`, so table-of-contents anchors
     * always resolve to the rendered heading.
     */
    const headingIds = new Map<string, number>()

    // Document-order counter for checklist item input/label ids — the same
    // scheme as `headingIds` above, reset per render. Payload's own
    // `ListJSXConverter.listitem` generates these with `uuidv4()` on every
    // render, which is random and mismatches between server and client
    // hydration; a counter is deterministic for the same document.
    let checklistItemIndex = 0

    return {
      ...defaultConverters,
      ...LinkJSXConverter({
        internalDocToHref,
      }),
      ...ListJSXConverter,
      listitem: (args) => {
        const { node, parent } = args

        if ('listType' in parent && parent.listType === 'check') {
          const id = `checklist-item-${checklistItemIndex++}`
          const hasSubLists = node.children.some((child) => child.type === 'list')
          const children = args.nodesToJSX({ nodes: node.children })

          return (
            <li
              aria-checked={node.checked ? 'true' : 'false'}
              className={`list-item-checkbox${node.checked ? ' list-item-checkbox-checked' : ' list-item-checkbox-unchecked'}${hasSubLists ? ' nestedListItem' : ''}`}
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- matches Payload's own ListJSXConverter, which this overrides for stable hydration ids
              role="checkbox"
              style={{ listStyleType: 'none' }}
              tabIndex={-1}
              value={node.value}
            >
              {hasSubLists ? (
                children
              ) : (
                <>
                  <input checked={node.checked} id={id} readOnly type="checkbox" />
                  <label htmlFor={id}>{children}</label>
                  <br />
                </>
              )}
            </li>
          )
        }

        return typeof ListJSXConverter.listitem === 'function'
          ? ListJSXConverter.listitem(args)
          : ListJSXConverter.listitem
      },
      link: linkConverter,
      /**
       * The default upload converter only handles Payload's built-in `media`
       * collection, so this project's `images` / `videos` collections render as
       * nothing. Both are handled explicitly here.
       */
      upload: (args) => {
        const value = args.node.value as
          | {
              url?: string
              mimeType?: string
              alt?: string
              width?: number
              height?: number
            }
          | undefined

        if (!value?.url) return null

        // populated upload values don't carry mimeType, so the collection the node
        // points at is the reliable discriminator
        const relationTo = (
          args.node as {
            relationTo?: string
          }
        ).relationTo

        if (relationTo === CollectionSlug.MediaVideos) {
          // the first thumbnail is the poster frame produced by the
          // GenerateVideoThumbnails task; its blurDataURL drives the blur-up
          const thumbnail = (
            args.node as {
              value?: {
                thumbnails?: {
                  value?: {
                    url?: string
                    blurDataURL?: string
                  }
                }[]
              }
            }
          ).value?.thumbnails?.[0]?.value

          return (
            <VideoMedia
              url={value.url}
              thumbnailURL={thumbnail?.url}
              blurDataURL={thumbnail?.blurDataURL}
              width={value.width}
              height={value.height}
              className="w-full rounded-lg"
            />
          )
        }

        if (relationTo === CollectionSlug.MediaImages && value.width && value.height) {
          return (
            <ImageMedia
              url={value.url}
              alt={value.alt || ''}
              width={value.width}
              height={value.height}
              className="h-auto w-full rounded-lg"
              sizes="(min-width: 768px) 46rem, 100vw"
            />
          )
        }

        return null
      },
      heading: ({ node, nodesToJSX }) => {
        const Tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

        const children = nodesToJSX({
          nodes: node.children,
        })

        const title = node.children
          .map((child) => ('text' in child && typeof child.text === 'string' ? child.text : ''))
          .join('')
          .trim()

        const base = generateSlug(title)
        const count = headingIds.get(base) ?? 0
        headingIds.set(base, count + 1)

        return (
          <Tag id={title ? (count === 0 ? base : `${base}-${count}`) : undefined}>{children}</Tag>
        )
      },
      /** Inline icon node inserted by the IconPicker Lexical feature. */
      icon: ({ node }) => {
        const iconName = (
          node as {
            iconName?: string
          }
        ).iconName

        if (!iconName) return null

        return (
          <Icon
            name={iconName}
            className="inline-block size-[1.1em] align-[-0.15em] text-[1.1em]"
          />
        )
      },
      blocks: {
        // Shiki is server-only, so highlighting is resolved ahead of render by
        // `highlightRichText` and looked up here. A miss (a caller that did not
        // pre-highlight) degrades to plain code rather than breaking the block.
        [BlockSlug.Code]: ({ node }) => {
          const code = node.fields.code ?? ''

          return (
            <CodeBlockShell
              code={code}
              html={highlightedCode[codeBlockKey(code, node.fields.language)]}
            />
          )
        },
        // Uses the sync `Columns`, not the async Server Component wrapper —
        // this converter runs on the client. Its columns use the `markdown`
        // editor variant, which has no BlocksFeature and so cannot contain
        // code blocks; nothing needs pre-highlighting here.
        [BlockSlug.TwoColumnContent]: ({ node }) => <Columns {...node.fields} />,
        [BlockSlug.LinkGroup]: ({ node }) => <LinkGroupBlockRenderer {...node.fields} />,
        // Uses the sync `HighlightBox`, not an async Server Component — this
        // converter runs on the client. Its content uses the `markdown`
        // editor variant, which has no BlocksFeature and so cannot contain
        // code blocks; nothing needs pre-highlighting here.
        [BlockSlug.HighlightBox]: ({ node }) => <HighlightBox {...node.fields} />,
        // banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
        // mediaBlock: ({ node }) => (
        //   <MediaBlock
        //     className="col-start-1 col-span-3"
        //     imgClassName="m-0"
        //     {...node.fields}
        //     captionClassName="mx-auto max-w-[48rem]"
        //     enableGutter={false}
        //     disableInnerContainer={true}
        //   />
        // ),
        // // [BlockSlug['Code']]: ({ node }) => <CodeBlockRenderer className="col-start-2" {...node.fields} />,
        // cta: ({ node }) => <CallToActionBlock {...node.fields} />,
      },
    }
  }

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  /**
   * Server-rendered Shiki markup from `highlightRichText`. Required for code
   * blocks to appear highlighted, since this is a Client Component and Shiki
   * cannot run here.
   */
  highlightedCode?: HighlightedCodeMap
} & HTMLAttributes<HTMLDivElement>

export function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    highlightedCode = {},
    ...rest
  } = props

  return (
    <ConvertRichText
      converters={buildJsxConverters(highlightedCode)}
      className={cn([
        'payload-richtext',
        enableGutter && 'container',
        !enableGutter && 'max-w-none',
        enableProse && 'prose mx-auto',
        className,
      ])}
      {...rest}
    />
  )
}

export default RichText

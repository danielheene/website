'use client'

// import { MediaBlock } from '@/blocks/MediaBlock/Component'

// import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'
// import type { BannerBlock as BannerBlockProps, CallToActionBlock as CTABlockProps, MediaBlock as MediaBlockProps } from '@/payload-types'
// import { BannerBlock } from '@/blocks/Banner/Component'
// import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/cn'
import { generateContentPath } from '@/utilities/generateContentURL'
import { BlockData } from '@custom-types'
import {
  DefaultNodeTypes,
  type DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedLinkNode
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText
} from '@payloadcms/richtext-lexical/react'
import { HTMLAttributes } from 'react'

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<BlockData>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }

  return generateContentPath(relationTo, value.slug as string)
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    // [BlockSlug.TwoColumnContent]: ({ node }) => <TwoColumnContentRenderer {...node.fields} />,
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
    // // [BlockSlug.Code]: ({ node }) => <CodeBlockRenderer className="col-start-2" {...node.fields} />,
    // cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & HTMLAttributes<HTMLDivElement>

export function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}

export default RichText

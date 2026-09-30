'use client'

import type { JSX } from 'react'
import { $applyNodeReplacement, type LexicalNode } from '@payloadcms/richtext-lexical/lexical'

import { BaseReadMoreNode } from './ReadMoreNode.base'

/**
 * Client "read more" node — renders the divider inside the editor so authors
 * can see where the excerpt cuts off. Separate from `ReadMoreServerNode` by
 * necessity (see `ReadMoreNode.base`); the shape they share lives there, so
 * only `decorate()` differs here.
 */
export class ReadMoreNode extends BaseReadMoreNode<JSX.Element> {
  decorate(): JSX.Element {
    return (
      <div
        className="my-2 flex select-none items-center gap-2 text-(--theme-elevation-400) text-xs"
        contentEditable={false}
      >
        <span className="h-px flex-1 bg-(--theme-elevation-150)" />
        <span className="whitespace-nowrap uppercase tracking-wide">
          Read more — excerpt ends here
        </span>
        <span className="h-px flex-1 bg-(--theme-elevation-150)" />
      </div>
    )
  }
}

export const $createReadMoreNode = (): ReadMoreNode => $applyNodeReplacement(new ReadMoreNode())

export const $isReadMoreNode = (node: LexicalNode | null | undefined): node is ReadMoreNode =>
  node instanceof ReadMoreNode

export { READ_MORE_NODE_TYPE, type SerializedReadMoreNode } from './ReadMoreNode.base'

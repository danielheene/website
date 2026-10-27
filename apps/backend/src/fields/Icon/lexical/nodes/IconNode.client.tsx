'use client'

import type { JSX } from 'react'
import { $applyNodeReplacement, type LexicalNode } from '@payloadcms/richtext-lexical/lexical'

import { Icon } from '@/components/Icon'

import { BaseIconNode } from './IconNode.base'

/**
 * Client icon node — renders the icon inside the editor.
 *
 * Separate from `IconServerNode` by necessity (see `IconNode.base`); the shape
 * they share lives in `BaseIconNode`, so only `decorate()` differs here.
 */
export class IconNode extends BaseIconNode<JSX.Element> {
  decorate(): JSX.Element {
    return (
      <Icon
        name={this.getIconName()}
        className="inline-block size-[1.1em] align-[-0.15em] text-[1.1em]"
      />
    )
  }
}

export const $createIconNode = (iconName: string): IconNode =>
  $applyNodeReplacement(
    new IconNode({
      iconName,
    }),
  )

export const $isIconNode = (node: LexicalNode | null | undefined): node is IconNode =>
  node instanceof IconNode

export { ICON_NODE_TYPE, type SerializedIconNode } from './IconNode.base'

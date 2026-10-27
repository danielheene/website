import type { LexicalNode } from '@payloadcms/richtext-lexical/lexical'

import { BaseIconNode } from './IconNode.base'

/**
 * Server icon node.
 *
 * Registered by the server feature so Payload can validate and serialize the
 * `icon` node; rendering is left to the `icon` converter in
 * `@/components/RichText`, hence the null `decorate()`.
 */
export class IconServerNode extends BaseIconNode<React.ReactNode> {
  decorate(): React.ReactNode {
    return null
  }
}

export const $isIconServerNode = (node: LexicalNode | null | undefined): node is IconServerNode =>
  node instanceof IconServerNode

export { ICON_NODE_TYPE, type SerializedIconNode } from './IconNode.base'

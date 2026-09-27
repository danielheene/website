import type { LexicalNode } from '@payloadcms/richtext-lexical/lexical'

import { BaseReadMoreNode } from './ReadMoreNode.base'

/**
 * Server "read more" node.
 *
 * Registered by the server feature so Payload can validate and serialize the
 * `readMore` node; rendering on the published page is left to the RichText
 * converter (which renders nothing for it), hence the null `decorate()`.
 */
export class ReadMoreServerNode extends BaseReadMoreNode<React.ReactNode> {
  decorate(): React.ReactNode {
    return null
  }
}

export const $isReadMoreServerNode = (
  node: LexicalNode | null | undefined,
): node is ReadMoreServerNode => node instanceof ReadMoreServerNode

export { READ_MORE_NODE_TYPE, type SerializedReadMoreNode } from './ReadMoreNode.base'

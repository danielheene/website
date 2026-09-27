import type {
  DOMExportOutput,
  NodeKey,
  SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical'

/**
 * Lexical node type shared by the client and server "read more" nodes — a
 * WordPress-style marker splitting a post into a leading excerpt (everything
 * before it) and the rest of the article. `generateExcerpt` (BlogPosts'
 * beforeChange hook) looks for this exact type when walking the content
 * tree, and the RichText converter renders it as nothing on the published
 * page — content flows continuously there, same as WordPress's own "more"
 * tag. It's only ever visible as a divider inside the editor.
 */
export const READ_MORE_NODE_TYPE = 'readMore'

export type SerializedReadMoreNode = SerializedLexicalNode

/**
 * Everything the client and server nodes have in common.
 *
 * The two concrete nodes stay separate classes on purpose — Lexical matches a
 * serialized node's `type` against the registered class by identity, so a
 * single class shared across both bundles makes loading existing documents
 * fail ("Type readMore in node ReadMoreServerNode does not match registered
 * node ReadMoreNode"). Subclassing keeps that separation while leaving one
 * definition of the shape, so the two can no longer drift apart. Subclasses
 * only supply `decorate()`: the client renders the in-editor divider, the
 * server renders nothing (see `ReadMoreNode.base`'s doc comment).
 */
export abstract class BaseReadMoreNode<TDecorated> extends DecoratorNode<TDecorated> {
  static getType(): string {
    return READ_MORE_NODE_TYPE
  }

  static clone<TNode extends BaseReadMoreNode<unknown>>(
    this: new (
      key?: NodeKey,
    ) => TNode,
    node: TNode,
  ): TNode {
    return new this(node.__key)
  }

  static importJSON<TNode extends BaseReadMoreNode<unknown>>(
    this: new (
      key?: NodeKey,
    ) => TNode,
  ): TNode {
    return new this()
  }

  /** A full-width divider, not part of a line of text. */
  isInline(): boolean {
    return false
  }

  getTextContent(): string {
    return '\n'
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div')
    element.className = 'lexical-read-more'
    return element
  }

  updateDOM(): boolean {
    return false
  }

  exportDOM(): DOMExportOutput {
    return {
      element: document.createElement('hr'),
    }
  }

  exportJSON(): SerializedReadMoreNode {
    return {
      ...super.exportJSON(),
      type: READ_MORE_NODE_TYPE,
      version: 1,
    }
  }
}

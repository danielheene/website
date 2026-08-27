import type {
  DOMExportOutput,
  EditorConfig,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'
import { DecoratorNode } from '@payloadcms/richtext-lexical/lexical'

/** Lexical node type shared by the client and server icon nodes. */
export const ICON_NODE_TYPE = 'icon'

export type SerializedIconNode = Spread<
  {
    /** Iconify icon name in `prefix:name` form. */
    iconName: string
  },
  SerializedLexicalNode
>

/**
 * Everything the client and server icon nodes have in common: the stored
 * `iconName`, the serialized shape and the DOM it exports.
 *
 * The two concrete nodes stay separate classes on purpose — Lexical matches a
 * serialized node's `type` against the registered class by identity, so a
 * single class shared across both bundles makes loading existing documents fail
 * ("Type icon in node IconServerNode does not match registered node IconNode").
 * Subclassing keeps that separation while leaving one definition of the shape,
 * so the two can no longer drift apart.
 *
 * Subclasses only supply `decorate()`, since that is the sole real difference:
 * the client renders an `<Icon />`, the server renders nothing.
 */
export abstract class BaseIconNode<TDecorated> extends DecoratorNode<TDecorated> {
  __iconName: string

  constructor({
    iconName,
    key,
  }: {
    iconName: string
    key?: NodeKey
  }) {
    super(key)
    this.__iconName = iconName
  }

  static getType(): string {
    return ICON_NODE_TYPE
  }

  /**
   * `this` is the concrete subclass at call time, so both `clone` and
   * `importJSON` produce the right node without either subclass restating them.
   */
  static clone<TNode extends BaseIconNode<unknown>>(
    this: new (args: {
      iconName: string
      key?: NodeKey
    }) => TNode,
    node: TNode,
  ): TNode {
    return new this({
      iconName: node.__iconName,
      key: node.__key,
    })
  }

  static importJSON<TNode extends BaseIconNode<unknown>>(
    this: new (args: {
      iconName: string
      key?: NodeKey
    }) => TNode,
    serializedNode: SerializedIconNode,
  ): TNode {
    return new this({
      iconName: serializedNode.iconName,
    })
  }

  /** Icons sit inside a line of text rather than forming their own block. */
  isInline(): boolean {
    return true
  }

  getIconName(): string {
    return this.__iconName
  }

  setIconName(iconName: string): void {
    const writable = this.getWritable()
    writable.__iconName = iconName
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement('span')
    element.className = 'lexical-icon'
    return element
  }

  updateDOM(): boolean {
    return false
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-icon', this.__iconName)
    return {
      element,
    }
  }

  exportJSON(): SerializedIconNode {
    return {
      ...super.exportJSON(),
      type: ICON_NODE_TYPE,
      version: 1,
      iconName: this.__iconName,
    }
  }
}

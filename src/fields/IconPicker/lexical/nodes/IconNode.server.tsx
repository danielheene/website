import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'
import {
  createCommand,
  DecoratorNode,
  type LexicalCommand,
} from '@payloadcms/richtext-lexical/lexical'

export type SerializedIconNode = Spread<
  {
    /** Iconify icon name in `prefix:name` form. */
    iconName: string
  },
  SerializedLexicalNode
>

/**
 * Inline Iconify icon node.
 *
 * Kept as a DecoratorNode so the editor renders a real icon while the stored
 * payload stays a single portable string (`prefix:name`).
 */
export class IconServerNode extends DecoratorNode<React.ReactNode> {
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

  static clone(node: IconServerNode): IconServerNode {
    return new this({
      iconName: node.__iconName,
      key: node.__key,
    })
  }

  static getType(): string {
    return 'icon'
  }

  static importJSON(serializedNode: SerializedIconNode): IconServerNode {
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
      type: 'icon',
      version: 1,
      iconName: this.__iconName,
    }
  }

  decorate(): React.ReactNode {
    return null
  }
}

export const $isIconNode = (node: LexicalNode | null | undefined): node is IconServerNode =>
  node instanceof IconServerNode

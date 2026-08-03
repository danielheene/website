'use client'

import type { JSX } from 'react'
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
} from '@payloadcms/richtext-lexical/lexical'

import { Icon } from '@repo/ui/Icon'

import type { SerializedIconNode } from './IconNode.server'

/**
 * Client icon node.
 *
 * Deliberately standalone rather than extending `IconServerNode`: Lexical
 * matches a serialized node's `type` against the registered class by identity,
 * so having a second class share the `icon` type in the browser bundle breaks
 * loading existing documents ("Type icon in node IconServerNode does not match
 * registered node IconNode"). Both classes serialize the same shape.
 */
export class IconNode extends DecoratorNode<JSX.Element> {
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

  static clone(node: IconNode): IconNode {
    return new IconNode({
      iconName: node.__iconName,
      key: node.__key,
    })
  }

  static getType(): string {
    return 'icon'
  }

  static importJSON(serializedNode: SerializedIconNode): IconNode {
    return new IconNode({
      iconName: serializedNode.iconName,
    })
  }

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

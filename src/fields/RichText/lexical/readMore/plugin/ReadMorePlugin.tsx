'use client'

import { useEffect } from 'react'
import { $getRoot, COMMAND_PRIORITY_EDITOR } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'

import { INSERT_READ_MORE_COMMAND } from '../commands'
import { $createReadMoreNode, $isReadMoreNode, ReadMoreNode } from '../ReadMoreNode.client'

/**
 * Registers the insert command. A post only makes sense with one excerpt
 * cutoff, so inserting again moves the existing marker instead of adding a
 * second one — `generateExcerpt` only ever looks for the first `readMore`
 * node, so a second one would just be silently ignored otherwise.
 */
export const ReadMorePlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (
      !editor.hasNodes([
        ReadMoreNode,
      ])
    ) {
      throw new Error('ReadMorePlugin: ReadMoreNode is not registered on this editor')
    }

    return editor.registerCommand(
      INSERT_READ_MORE_COMMAND,
      () => {
        editor.update(() => {
          const existing = $getRoot()
            .getChildren()
            .find((node) => $isReadMoreNode(node))
          existing?.remove()

          $insertNodeToNearestRoot($createReadMoreNode())
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [
    editor,
  ])

  return null
}

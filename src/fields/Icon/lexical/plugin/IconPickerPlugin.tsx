'use client'

import { useEffect } from 'react'
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { useDrawerSlug, useModal } from '@payloadcms/ui'

import { IconPickerDrawer } from '../../IconPickerDrawer'
import { INSERT_ICON_COMMAND } from '../nodes/commands'
import { $createIconNode, IconNode } from '../nodes/IconNode.client'

/**
 * Registers the icon insert command and renders the picker drawer that the
 * toolbar button and slash menu open.
 */
export const IconPickerPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const { closeModal, openModal } = useModal()
  const drawerSlug = useDrawerSlug('icon-picker-lexical')

  useEffect(() => {
    if (
      !editor.hasNodes([
        IconNode,
      ])
    ) {
      throw new Error('IconPickerPlugin: IconNode is not registered on this editor')
    }

    return editor.registerCommand<string | undefined>(
      INSERT_ICON_COMMAND,
      (iconName) => {
        // dispatched without a name from the toolbar: open the picker and let
        // the selection dispatch again with a concrete icon
        if (!iconName) {
          openModal(drawerSlug)
          return true
        }

        editor.update(() => {
          $insertNodes([
            $createIconNode(iconName),
          ])
        })
        closeModal(drawerSlug)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [
    editor,
    drawerSlug,
    openModal,
    closeModal,
  ])

  return (
    <IconPickerDrawer
      slug={drawerSlug}
      title="Insert icon"
      onSelectAction={(iconName) => {
        editor.dispatchCommand(INSERT_ICON_COMMAND, iconName)
      }}
    />
  )
}

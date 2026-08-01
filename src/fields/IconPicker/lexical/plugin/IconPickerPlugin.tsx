'use client'

import { useEffect, useState } from 'react'
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'

import { IconPickerPanel } from '../../components/IconPickerPanel'
import { INSERT_ICON_COMMAND } from '../nodes/commands'
import { $createIconNode, IconNode } from '../nodes/IconNode.client'

/**
 * Registers the icon insert command and renders the picker popover that the
 * toolbar button opens.
 */
export const IconPickerPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [open, setOpen] = useState<boolean>(false)

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
          setOpen(true)
          return true
        }

        editor.update(() => {
          $insertNodes([
            $createIconNode(iconName),
          ])
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [
    editor,
  ])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Insert icon"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <button
        type="button"
        aria-label="Close icon picker"
        className="absolute inset-0 cursor-default"
        onClick={() => setOpen(false)}
      />

      <div className="relative w-[min(32rem,90vw)] rounded-lg border border-[var(--theme-elevation-150)] bg-[var(--theme-bg)] p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium">Insert icon</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-[var(--theme-elevation-150)] px-2 py-1 text-sm hover:bg-[var(--theme-elevation-50)]"
          >
            Close
          </button>
        </div>

        <IconPickerPanel
          onSelectAction={(iconName) => {
            editor.dispatchCommand(INSERT_ICON_COMMAND, iconName)
            setOpen(false)
          }}
        />
      </div>
    </div>
  )
}

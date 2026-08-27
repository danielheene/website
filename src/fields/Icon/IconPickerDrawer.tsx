'use client'

import { Drawer, useModal } from '@payloadcms/ui'

import { IconPicker, type IconPickerProps } from './IconPicker'

export interface IconPickerDrawerProps extends Omit<IconPickerProps, 'className'> {
  /** Drawer slug, from `useDrawerSlug` in the owning component. */
  slug: string
  title?: string
}

/**
 * The icon picker inside Payload's Drawer.
 *
 * Using the admin's own drawer rather than a hand-rolled modal means focus
 * trapping, Escape handling, stacking order and nested-drawer depth all behave
 * the way the rest of the panel does — including inside the Lexical editor,
 * which is itself often already in a drawer.
 *
 * Selecting an icon closes the drawer, so both mount points get the same
 * pick-and-dismiss flow.
 */
export const IconPickerDrawer = ({
  slug,
  title = 'Select icon',
  onSelectAction,
  onClearAction,
  ...pickerProps
}: IconPickerDrawerProps) => {
  const { closeModal } = useModal()

  return (
    <Drawer slug={slug} title={title}>
      <IconPicker
        {...pickerProps}
        className="max-w-[400px]"
        onSelectAction={(icon) => {
          onSelectAction(icon)
          closeModal(slug)
        }}
        onClearAction={
          onClearAction &&
          (() => {
            onClearAction()
            closeModal(slug)
          })
        }
      />
    </Drawer>
  )
}

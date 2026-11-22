// the manager bundle compiles JSX with the classic transform, which needs React in scope
import React, { type ComponentType } from 'react'

import { ContrastIcon, MoonIcon } from '@storybook/icons'
import { ToggleButton } from 'storybook/internal/components'
import { STORY_PREPARED } from 'storybook/internal/core-events'
import { addons, types, useGlobals, type State } from 'storybook/manager-api'

import { DARK_MODE_GLOBAL, DUO_TONE_GLOBAL } from './toolbarGlobals'

type ToggleToolProps = {
  globalKey: string
  label: string
  Icon: ComponentType
}

/** A toolbar button that flips one boolean global, like the built-in grid toggle. */
const ToggleTool = ({ globalKey, label, Icon }: ToggleToolProps) => {
  const [globals, updateGlobals] = useGlobals()
  const pressed = globals[globalKey] === true

  return (
    <ToggleButton
      padding="small"
      variant="ghost"
      pressed={pressed}
      ariaLabel={label}
      onClick={() => updateGlobals({ [globalKey]: !pressed })}
    >
      <Icon />
    </ToggleButton>
  )
}

const inPreview = ({ viewMode }: { viewMode?: string }) =>
  viewMode === 'story' || viewMode === 'docs'

/** Stories tagged `preview-only` (the emails, which bring their own toolbar) hide the toolbar and addon panel. */
const PREVIEW_ONLY_TAG = 'preview-only'

const isPreviewOnly = (state: State) =>
  state.viewMode === 'story' &&
  state.index?.[state.storyId]?.tags?.includes(PREVIEW_ONLY_TAG) === true

// kept next to the layout Storybook persists in sessionStorage, so the two stay in step across reloads
const PANEL_HIDDEN_KEY = 'heene:addon-panel-hidden-by-story'

const readPanelHidden = () => {
  try {
    return sessionStorage.getItem(PANEL_HIDDEN_KEY) === 'true'
  } catch {
    return false
  }
}

const writePanelHidden = (hidden: boolean) => {
  try {
    sessionStorage.setItem(PANEL_HIDDEN_KEY, String(hidden))
  } catch {
    // without storage, a reload on a preview-only story leaves the panel closed
  }
}

addons.setConfig({
  layoutCustomisations: {
    showToolbar: (state, defaultValue) => (isPreviewOnly(state) ? false : defaultValue),
  },
})

/**
 * The panel can't use `layoutCustomisations.showPanel`: the layout only re-reads it when its own
 * state changes, so it stays hidden after leaving the story. Toggling it instead reopens only a
 * panel a story closed, so one closed by hand stays closed.
 */
addons.register('heene/preview-only', (api) => {
  // fires for every story the preview renders, revisits included, with that story's id
  api.on(STORY_PREPARED, ({ id }: { id: string }) => {
    if (id !== api.getUrlState().storyId) return

    const hide = api.getData(id)?.tags?.includes(PREVIEW_ONLY_TAG) === true

    if (hide && api.getIsPanelShown()) {
      api.togglePanel(false)
      writePanelHidden(true)
    } else if (!hide && readPanelHidden()) {
      api.togglePanel(true)
      writePanelHidden(false)
    }
  })
})

// folders (`group` nodes) under the Foundations root, e.g. Typography
const FOUNDATION_FOLDER = '[data-item-id^="foundations-"][data-nodetype="group"]'

/**
 * Keeps the Foundations folders open. The sidebar holds its expanded state privately and offers no
 * setting for it, so each collapsed folder button is clicked open as the sidebar renders it; the
 * chevron is hidden and the button made inert so it can't be collapsed again.
 */
const expandFoundationFolders = () => {
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    `${FOUNDATION_FOLDER} > button[aria-expanded="false"]`,
  )) {
    button.click()
  }
}

const foundationFolderStyle = document.createElement('style')

foundationFolderStyle.textContent = `
  ${FOUNDATION_FOLDER} > button { pointer-events: none; }
  ${FOUNDATION_FOLDER} > button > div > div:first-child > svg { visibility: hidden; }
`

document.head.append(foundationFolderStyle)

new MutationObserver(expandFoundationFolders).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['aria-expanded'],
})

addons.register('heene/toolbar', () => {
  addons.add('heene/toolbar/dark-mode', {
    type: types.TOOL,
    title: 'Dark mode',
    match: inPreview,
    render: () => <ToggleTool globalKey={DARK_MODE_GLOBAL} label="Dark mode" Icon={MoonIcon} />,
  })

  addons.add('heene/toolbar/duo-tone', {
    type: types.TOOL,
    title: 'DuoTone',
    match: inPreview,
    render: () => <ToggleTool globalKey={DUO_TONE_GLOBAL} label="DuoTone" Icon={ContrastIcon} />,
  })
})

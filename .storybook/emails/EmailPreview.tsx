import { useEffect, useState, type ComponentType, type ReactElement } from 'react'
import { render, pretty, toPlainText } from 'react-email'

import { BrowserIcon, MarkupIcon, MobileIcon, ParagraphIcon } from '@storybook/icons'
import { themes } from 'storybook/theming'

type Format = 'html' | 'text'

type Viewport = 'mobile' | 'desktop'

// a common phone width; desktop leaves the email at the canvas's full width
const MOBILE_WIDTH = 375

type EmailPreviewProps = {
  email: ReactElement
}

type ToggleOption<T extends string> = {
  value: T
  label: string
  Icon: ComponentType
}

const barColors = (theme: typeof themes.light) =>
  [
    `--bar-bg: ${theme.barBg};`,
    `--bar-border: ${theme.appBorderColor};`,
    `--bar-text: ${theme.barTextColor};`,
    `--bar-hover: ${theme.barHoverColor};`,
    `--bar-selected: ${theme.barSelectedColor};`,
  ].join(' ')

/**
 * Storybook's own bar colors, light and dark: the manager follows the system color scheme, and so
 * does this bar (the site's theme toggle doesn't apply here).
 */
const BAR_THEME = `
  [data-email-toolbar] { ${barColors(themes.light)} }
  @media (prefers-color-scheme: dark) { [data-email-toolbar] { ${barColors(themes.dark)} } }
`

type ToggleGroupProps<T extends string> = {
  label: string
  options: ToggleOption<T>[]
  value: T
  onChange: (value: T) => void
}

/** Buttons sized and colored like the toolbar's own tools (28px, 14px icons, 12px bold labels). */
const ToggleGroup = <T extends string>({
  label,
  options,
  value,
  onChange,
}: ToggleGroupProps<T>) => (
  <fieldset aria-label={label} className="m-0 flex min-w-0 items-center gap-1 border-0 p-0">
    {options.map(({ value: option, label: optionLabel, Icon }) => (
      <button
        key={option}
        type="button"
        aria-pressed={option === value}
        onClick={() => onChange(option)}
        className={
          option === value
            ? 'flex h-7 cursor-pointer items-center gap-1.5 rounded bg-[color-mix(in_srgb,var(--bar-selected)_7%,transparent)] px-[7px] text-xs font-bold text-(--bar-selected) [&_svg]:size-3.5'
            : 'flex h-7 cursor-pointer items-center gap-1.5 rounded px-[7px] text-xs font-bold text-(--bar-text) hover:bg-[color-mix(in_srgb,var(--bar-hover)_7%,transparent)] hover:text-(--bar-hover) [&_svg]:size-3.5'
        }
      >
        <Icon />
        {optionLabel}
      </button>
    ))}
  </fieldset>
)

const VIEWPORTS: ToggleOption<Viewport>[] = [
  { value: 'mobile', label: 'Mobile', Icon: MobileIcon },
  { value: 'desktop', label: 'Desktop', Icon: BrowserIcon },
]

const FORMATS: ToggleOption<Format>[] = [
  { value: 'html', label: 'HTML', Icon: MarkupIcon },
  { value: 'text', label: 'Text', Icon: ParagraphIcon },
]

/**
 * Renders an email the way it is sent (`renderEmail` in `src/emails/render.ts`)
 * and shows it in an iframe, so neither the email's inline styles nor
 * Storybook's theme leak into the other. Its own toolbar replaces Storybook's
 * (hidden by the `preview-only` tag, see `manager.tsx`).
 */
export const EmailPreview = ({ email }: EmailPreviewProps) => {
  const [format, setFormat] = useState<Format>('html')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [output, setOutput] = useState<string | null>(null)
  const [height, setHeight] = useState(600)

  useEffect(() => {
    let current = true

    void Promise.resolve()
      .then(() => render(email))
      .then((html) =>
        format === 'html'
          ? pretty(html)
          : toPlainText(html, {
              preserveNewlines: true,
              selectors: [
                {
                  selector: 'a',
                  options: {
                    linkBrackets: true,
                    hideLinkHrefIfSameAsText: true,
                    leadingLineBreaks: 1,
                    trailingLineBreaks: 1,
                  },
                },
              ],
            }),
      )
      .then((rendered) => current && setOutput(rendered))

    return () => {
      current = false
    }
  }, [email, format])

  const width = viewport === 'mobile' ? MOBILE_WIDTH : '100%'

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <style>{BAR_THEME}</style>
      <div
        data-email-toolbar
        className="sticky top-0 z-10 grid h-10 grid-cols-3 items-center bg-(--bar-bg) px-2.5 shadow-[inset_0_-1px_0_0_var(--bar-border)]"
        style={{ fontFamily: themes.light.fontBase }}
      >
        <div className="col-start-2 justify-self-center">
          <ToggleGroup<Viewport>
            label="Viewport"
            options={VIEWPORTS}
            value={viewport}
            onChange={setViewport}
          />
        </div>
        <div className="col-start-3 justify-self-end">
          <ToggleGroup<Format>
            label="Format"
            options={FORMATS}
            value={format}
            onChange={setFormat}
          />
        </div>
      </div>

      <div className="flex justify-center p-6">
        {output === null && <p>Rendering…</p>}

        {output !== null && format === 'text' && (
          <pre
            className="max-w-full bg-background p-6 font-mono text-sm whitespace-pre-wrap"
            style={{ width }}
          >
            {output}
          </pre>
        )}

        {output !== null && format === 'html' && (
          <iframe
            // a new width reflows the email, so remount to measure its height again
            key={viewport}
            title="Email preview"
            srcDoc={output}
            sandbox="allow-same-origin allow-popups"
            style={{ width, height, border: 0, background: 'white' }}
            onLoad={({ currentTarget }) => {
              const body = currentTarget.contentDocument?.documentElement

              if (body) setHeight(body.scrollHeight)
            }}
          />
        )}
      </div>
    </div>
  )
}

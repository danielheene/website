import type { FC, MouseEvent } from 'react'

import { SELECT_STORY } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { cn } from 'tailwind-variants'

export const defaultSampleText = 'Heavy boxes perform quick waltzes and jigs.'

// written out so Tailwind sees each class; the values come from the theme (`_text.css`)
const FONT_SIZES = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
  'text-9xl',
] as const

const WEIGHT_NAMES = new Map([
  [100, 'Thin'],
  [200, 'Extralight'],
  [300, 'Light'],
  [400, 'Regular'],
  [500, 'Medium'],
  [600, 'Semibold'],
  [700, 'Bold'],
  [800, 'Extrabold'],
  [900, 'Black'],
])

export type FontFaceId = 'pp-frama' | 'pp-frama-text' | 'pp-supply-mono' | 'pp-supply-sans'

type FontFace = {
  name: string
  /** The utility class, written out so Tailwind sees it. */
  className: string
  /** Weights with a font file of their own; the others in `style.css` fall back to these. */
  weights: number[]
  /** The face's own docs page. */
  docsId: string
}

export const FONT_FACES: Record<FontFaceId, FontFace> = {
  'pp-frama': {
    name: 'PP Frama',
    className: 'font-pp-frama',
    weights: [100, 200, 300, 400, 500, 700, 900],
    docsId: 'foundations-typography-pp-frama--docs',
  },
  'pp-frama-text': {
    name: 'PP Frama Text',
    className: 'font-pp-frama-text',
    weights: [300, 400, 700],
    docsId: 'foundations-typography-pp-frama-text--docs',
  },
  'pp-supply-mono': {
    name: 'PP Supply Mono',
    className: 'font-pp-supply-mono',
    weights: [200, 400, 500, 700],
    docsId: 'foundations-typography-pp-supply-mono--docs',
  },
  'pp-supply-sans': {
    name: 'PP Supply Sans',
    className: 'font-pp-supply-sans',
    weights: [200, 400, 500, 700],
    docsId: 'foundations-typography-pp-supply-sans--docs',
  },
}

const CARD = cn([
  'rounded-md border border-border bg-card',
  'shadow-[0_1px_3px_rgb(0_0_0/10%)] dark:shadow-[0_2px_5px_rgb(0_0_0/20%)]',
])

const weightLabel = (weight: number) => `${weight} · ${WEIGHT_NAMES.get(weight) ?? ''}`

type TypesetProps = {
  face: FontFaceId
  fontWeight: number
  sampleText?: string
}

/** Every theme font size in one face and weight. */
export const Typeset: FC<TypesetProps> = ({ face, fontWeight, sampleText = defaultSampleText }) => (
  <div
    className={cn(
      CARD,
      'mt-4 mb-14 grid grid-cols-[min-content_auto] items-baseline gap-x-6 gap-y-3 px-5 py-6',
    )}
  >
    {FONT_SIZES.map((size) => (
      <div key={size} className="contents">
        <span className="font-mono text-xs text-foreground/60">{size.replace('text-', '')}</span>
        <span
          className={cn(
            'overflow-hidden text-ellipsis whitespace-nowrap',
            FONT_FACES[face].className,
            size,
          )}
          style={{ fontWeight }}
        >
          {sampleText}
        </span>
      </div>
    ))}
  </div>
)

const SNIPPET = [
  'Heavy boxes perform quick waltzes and jigs.',
  'Sphinx of black quartz, judge my vow — 0123456789',
  'The five boxing wizards jump quickly, & so on.',
]

// docs render in the preview iframe, so a relative href would resolve against iframe.html
const docsHref = (docsId: string) => `${window.parent.location.pathname}?path=/docs/${docsId}`

const openDocs = (event: MouseEvent, docsId: string) => {
  // modified clicks keep the browser's own behaviour (new tab, new window)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return

  event.preventDefault()
  addons.getChannel().emit(SELECT_STORY, { storyId: docsId, viewMode: 'docs' })
}

type FaceProps = {
  face: FontFaceId
}

/** The line under a face's heading: its weights, and a link to its page. */
export const FontFaceMeta: FC<FaceProps> = ({ face }) => {
  const { weights, docsId } = FONT_FACES[face]

  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs text-foreground/60">
      <span>{weights.map(weightLabel).join(', ')}</span>
      <a
        href={docsHref(docsId)}
        target="_top"
        onClick={(event) => openDocs(event, docsId)}
        className="ml-auto text-foreground underline"
      >
        All sizes and weights →
      </a>
    </p>
  )
}

/** A short multiline sample in one face. */
export const FontSample: FC<FaceProps> = ({ face }) => (
  <div className={cn(CARD, 'mt-4 mb-14 p-6 text-foreground')}>
    <p className={cn('text-2xl leading-snug', FONT_FACES[face].className)}>
      {SNIPPET.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  </div>
)

const PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla, vestibulum id ligula porta felis euismod semper.',
  'Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean lacinia bibendum nulla sed consectetur. Curabitur blandit tempus porttitor, cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis, morbi leo risus porta ac consectetur ac.',
  'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Nulla vitae elit libero, a pharetra augue.',
]

/** Running text set with the site's `prose` styles, as a blog post or rich-text page shows it. */
export const RunningText: FC = () => (
  <div className={cn(CARD, 'my-6 px-8 py-10')}>
    <article className="prose mx-auto max-w-prose text-foreground">
      <h2>Lorem ipsum dolor sit amet</h2>
      <p>{PARAGRAPHS[0]}</p>
      <p>
        {PARAGRAPHS[1]} <a href="#running-text">Inline links</a>, <strong>strong</strong>,{' '}
        <em>emphasis</em> and <code>inline code</code> sit in the same line.
      </p>
      <h3>Consectetur adipiscing elit</h3>
      <p>{PARAGRAPHS[2]}</p>
      <blockquote>
        <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam.</p>
      </blockquote>
      <p>{PARAGRAPHS[3]}</p>
    </article>
  </div>
)

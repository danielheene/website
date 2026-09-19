import { Component, type ReactNode } from 'react'

import * as RadixSlot from '@radix-ui/react-slot'
import type { Meta, StoryObj } from '@storybook/nextjs'

import { Icon } from '@/components/Icon'

/**
 * `@radix-ui/react-slot`'s own docs mostly show the `asChild` merge in
 * isolation — this sketches every shape it actually supports, including two
 * things that aren't obvious from the README: what happens when a slotted
 * component has more than one child (it throws, unless one of them is
 * wrapped in `Slottable`), and `Slottable`'s second, render-prop form, which
 * injects markup *around* the slotted element's own children without
 * touching the element `Slot` merges onto.
 */
const meta = {
  title: 'Patterns/Radix Slot',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const frame = 'border border-border bg-card p-4 flex flex-col gap-3 font-mono text-sm'
const label = 'text-xs uppercase tracking-wide opacity-60'

/**
 * The base case: `Slot` takes exactly one element child and clones it,
 * merging `className`/`style`/event handlers and forwarding every other
 * prop straight onto it. Nothing here renders a `<button>` — inspect the
 * DOM and the single element that comes out is the `<button>`, now carrying
 * the extra styling `Slot` was given.
 */
export const BasicMerge: Story = {
  name: 'Slot/Basic merge (asChild)',
  render: () => (
    <div className={frame}>
      <span className={label}>
        &lt;Slot className=&quot;...&quot; onClick=&#123;...&#125;&gt; wrapping a single
        &lt;button&gt;
      </span>
      <RadixSlot.Slot
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5"
        onClick={() => alert('Slot merged this onClick onto the <button> below')}
      >
        <button type="button" className="text-primary">
          I am a &lt;button&gt;, styled and wired up by Slot
        </button>
      </RadixSlot.Slot>
      <span className={label}>
        Inspect the element above: it&apos;s one &lt;button&gt;, not a &lt;button&gt; nested inside
        a wrapper — Slot never renders its own DOM node.
      </span>
    </div>
  ),
}

/**
 * `className`, `style`, and `on*` handlers merge (both sides run for
 * handlers; the child's keys win for `className`/`style` conflicts) rather
 * than one side clobbering the other — every other prop is a plain override
 * where the child's value wins.
 */
export const PropMerging: Story = {
  name: 'Slot/Prop merging rules',
  render: () => (
    <div className={frame}>
      <span className={label}>className merges — both classes end up on the element</span>
      <RadixSlot.Slot className="text-primary p-2 border border-dashed border-border">
        <div className="font-bold">Slot gave me text-primary, I already had font-bold</div>
      </RadixSlot.Slot>

      <span className={label}>
        style merges as an object spread — the child&apos;s keys win on conflict
      </span>
      <RadixSlot.Slot
        style={{
          padding: 8,
          color: 'red',
        }}
      >
        <div
          style={{
            color: 'green',
            fontWeight: 600,
          }}
        >
          padding came from Slot, color is green (child wins over Slot&apos;s red)
        </div>
      </RadixSlot.Slot>

      <span className={label}>
        onClick merges — the child&apos;s handler runs, then Slot&apos;s
      </span>
      <RadixSlot.Slot
        className="border border-border p-2"
        onClick={() => console.log("2. Slot's onClick ran (see console)")}
      >
        <button
          type="button"
          className="text-left w-full"
          onClick={() => console.log("1. child's onClick ran first (see console)")}
        >
          Click me, then check the console
        </button>
      </RadixSlot.Slot>

      <span className={label}>every other prop is a plain override — child&apos;s value wins</span>
      <RadixSlot.Slot data-demo="from-slot">
        <div data-demo="from-child">
          data-demo ends up &quot;from-child&quot; (inspect the element)
        </div>
      </RadixSlot.Slot>
    </div>
  ),
}

type ErrorBoundaryState = {
  message: string | null
}

/**
 * The failure mode `Slottable` exists to fix: a bare `Slot` requires exactly
 * one element child. An icon-plus-label button needs two — feeding `Slot`
 * that pair throws `"...failed to slot onto its children. Expected a single
 * React element child or \`Slottable\`."` at render, reproduced live here via
 * an error boundary instead of just describing it.
 */
class DemoErrorBoundary extends Component<
  {
    children: ReactNode
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    message: null,
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      message: error instanceof Error ? error.message : String(error),
    }
  }

  render() {
    if (this.state.message) {
      return (
        <pre className="text-destructive whitespace-pre-wrap text-xs border border-destructive/40 bg-destructive/10 p-3">
          {this.state.message}
        </pre>
      )
    }
    return this.props.children
  }
}

/** A React element `Slot` can't merge onto: two children, neither is `Slottable`. */
const TwoUnwrappedChildren = () => (
  <RadixSlot.Slot className="inline-flex items-center gap-1.5">
    <Icon name="material-symbols:check-circle" />
    <span>Two children, no Slottable</span>
  </RadixSlot.Slot>
)

export const MultipleChildrenThrows: Story = {
  name: 'Slot/Multiple children (throws)',
  render: () => (
    <div className={frame}>
      <span className={label}>
        &lt;Slot&gt; with two children — an icon and text — instead of one
      </span>
      <DemoErrorBoundary>
        <TwoUnwrappedChildren />
      </DemoErrorBoundary>
    </div>
  ),
}

/**
 * `Slottable`'s first form: wrap whichever sibling should receive `Slot`'s
 * merged props in `<Slottable>`, and put anything else (an icon, a badge)
 * next to it as an ordinary sibling. `Slot` finds the `Slottable`, clones
 * *that* element with the merged props, and re-inserts the other siblings
 * around it in their original order.
 */
export const SlottableChildren: Story = {
  name: 'Slottable/Wrapping one of several children',
  render: () => (
    <div className={frame}>
      <span className={label}>
        &lt;Slot&gt; around [Icon,
        &lt;Slottable&gt;&lt;span&gt;label&lt;/span&gt;&lt;/Slottable&gt;]
      </span>
      <RadixSlot.Slot className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5">
        <Icon name="material-symbols:rocket-launch" data-icon="inline-start" />
        <RadixSlot.Slottable>
          <span className="font-medium">
            I&apos;m the Slottable — I receive Slot&apos;s merged className
          </span>
        </RadixSlot.Slottable>
      </RadixSlot.Slot>
      <span className={label}>
        The icon stays a plain, untouched sibling; only the &lt;span&gt; picked up Slot&apos;s
        classes.
      </span>
    </div>
  ),
}

/**
 * `Slottable`'s second, render-prop form: `child` names the element to slot
 * onto, and `children` is a function that receives *that element's own
 * children* and returns replacement content — letting you wrap or augment
 * what's inside the slotted element without cloning the element itself
 * twice or fighting over its `children` prop.
 */
export const SlottableRenderProp: Story = {
  name: 'Slottable/Render-prop form (wrapping inner content)',
  render: () => (
    <div className={frame}>
      <span className={label}>
        &lt;Slottable child=&#123;target&#125;&gt;&#123;(inner) =&gt; &lt;&gt;prefix
        &#123;inner&#125; suffix&lt;/&gt;&#125;&lt;/Slottable&gt;
      </span>
      <RadixSlot.Slot className="rounded-md border border-border px-3 py-1.5">
        <RadixSlot.Slottable child={<div>original children go in the middle</div>}>
          {(inner) => (
            <>
              <span className="opacity-60">[loading] </span>
              {inner}
              <span className="opacity-60"> [/loading]</span>
            </>
          )}
        </RadixSlot.Slottable>
      </RadixSlot.Slot>
      <span className={label}>
        The rendered &lt;div&gt; is still the one element Slot merged props onto — only its own
        children were replaced by the function&apos;s return value.
      </span>
    </div>
  ),
}

/**
 * `createSlot`/`createSlottable` are `Slot`/`Slottable` factories that bake
 * in an owner name, so a thrown error names your component instead of a
 * generic "Slot" — this repo's own `Button` does exactly this (see
 * `src/components/Button/Button.tsx`).
 */
const MyButtonSlot = RadixSlot.createSlot('MyButton.Slot')

export const NamedFactory: Story = {
  name: 'createSlot/createSlottable (named, like Button.tsx)',
  render: () => (
    <div className={frame}>
      <span className={label}>
        const MyButtonSlot = createSlot(&apos;MyButton.Slot&apos;) — behaves exactly like
        &lt;Slot&gt;, but its displayName and error messages say &quot;MyButton.Slot&quot; instead
        of &quot;Slot&quot;.
      </span>
      <MyButtonSlot className="rounded-md border border-border px-3 py-1.5">
        <button type="button">Still just a &lt;button&gt;, merged the same way</button>
      </MyButtonSlot>
    </div>
  ),
}

// @vitest-environment jsdom
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Reveal } from './Reveal'

let intersect: (isIntersecting: boolean) => void
const disconnect = vi.fn()

class IntersectionObserverStub {
  constructor(callback: IntersectionObserverCallback) {
    intersect = (isIntersecting) =>
      callback(
        [
          {
            isIntersecting,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      )
  }
  observe = vi.fn()
  disconnect = disconnect
}

const stubReducedMotion = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: reduce,
    })),
  )

const stubPosition = (top: number) =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 100,
  } as DOMRect)

const tree = (
  <Reveal data-testid="reveal">
    <div data-reveal-item>one</div>
    <div>not animated</div>
    <div data-reveal-item>two</div>
  </Reveal>
)

const hydrate = async () => {
  const container = document.createElement('div')
  container.innerHTML = renderToString(tree)
  document.body.appendChild(container)
  await act(async () => {
    hydrateRoot(container, tree)
  })
  return container.firstElementChild as HTMLElement
}

describe('Reveal', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
    stubReducedMotion(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('hides client-rendered content until it scrolls into view', () => {
    const { getByTestId } = render(tree)
    const element = getByTestId('reveal')

    expect(element.dataset.reveal).toBe('hidden')

    act(() => intersect(false))
    expect(element.dataset.reveal).toBe('hidden')

    act(() => intersect(true))
    expect(element.dataset.reveal).toBe('visible')
    expect(disconnect).toHaveBeenCalled()
  })

  it('indexes only the marked items for the stagger', () => {
    const { getByTestId } = render(tree)
    const items = getByTestId('reveal').querySelectorAll<HTMLElement>('[data-reveal-item]')

    expect([...items].map((item) => item.style.getPropertyValue('--reveal-index'))).toEqual([
      '0',
      '1',
    ])
  })

  it('shows content immediately under prefers-reduced-motion', () => {
    stubReducedMotion(true)
    const { getByTestId } = render(tree)

    expect(getByTestId('reveal').dataset.reveal).toBe('visible')
  })

  it('keeps server-rendered content that is already in view visible', async () => {
    stubPosition(0)

    expect((await hydrate()).dataset.reveal).toBe('visible')
  })

  it('still animates server-rendered content below the fold', async () => {
    stubPosition(window.innerHeight + 200)

    expect((await hydrate()).dataset.reveal).toBe('hidden')
  })
})

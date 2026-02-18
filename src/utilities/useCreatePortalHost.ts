'use client'

import React from 'react'

export const useCreatePortalHost = <
  ElementTag extends keyof HTMLElementTagNameMap = 'div',
  ElementRef extends HTMLElementTagNameMap[keyof HTMLElementTagNameMap] = HTMLElementTagNameMap[ElementTag],
>(
  id: string,
  elementTag: ElementTag = 'div' as ElementTag,
): React.RefObject<ElementRef> => {
  const hostRef = React.useRef<ElementRef>(null)

  React.useEffect(() => {
    if (hostRef.current === null && typeof document !== 'undefined') {
      hostRef.current = (() => {
        let element = document.getElementById(id)

        if (!element) {
          element = document.createElement(elementTag || 'div')
          element.id = id
          document.body.appendChild(element)
        }

        return element as ElementRef
      })()
    }

    return (): void => {
      if (hostRef.current && typeof document !== 'undefined') {
        hostRef.current.remove()
        hostRef.current = null
      }
    }

    // pass empty dependencies to avoid updates on render,
    // because the portal is bound to the host after mounting
  }, [elementTag, id])

  return hostRef
}

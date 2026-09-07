'use client'

import { useEffect, useRef, useState } from 'react'

import { startCase } from 'lodash-es'

import { Button } from '@/components/Button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ButtonGroup'
import { Icon } from '@/components/Icon'

interface RotatingFilterProps {
  ariaLabel: string
  allLabel: string
  options: string[]
  selected: string | null
  onSelect: (value: string | null) => void
}

/**
 * One `[prev][dropdown][next]` filter control — ported directly from the
 * dashboard's `ScheduledJobsWidget.Header` queue selector, down to its
 * `Button`/`ButtonGroup`/`Icon` components, so the colors match exactly
 * rather than approximating them through Payload's own `buttonStyle`s. The
 * site's Tailwind theme (`bg-secondary`, `bg-primary`, …) is already loaded
 * into the admin bundle via `payload.css`, so these render correctly here.
 *
 * `null` (the "all" option) sits before the first and after the last real
 * option, so stepping past either end of `options` lands on "all" rather
 * than wrapping straight from last to first.
 */
export const RotatingFilter = ({
  ariaLabel,
  allLabel,
  options,
  selected,
  onSelect,
}: RotatingFilterProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isPopupOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [
    isPopupOpen,
  ])

  const handleSelect = (value: string | null) => {
    onSelect(value)
    setIsPopupOpen(false)
  }

  const move = (direction: 1 | -1) => {
    if (selected === null) {
      handleSelect(direction === 1 ? options[0] : options[options.length - 1])
      return
    }

    const currentIndex = options.indexOf(selected)
    const nextIndex = currentIndex + direction

    if (nextIndex < 0 || nextIndex >= options.length) {
      handleSelect(null)
      return
    }

    handleSelect(options[nextIndex])
  }

  const label = selected ? startCase(selected) : allLabel

  return (
    <fieldset className="rotating-filter">
      <legend className="sr-only">{ariaLabel}</legend>

      <ButtonGroup>
        <Button
          variant="secondary"
          type="button"
          size="icon-lg"
          onClick={() => move(-1)}
          disabled={options.length === 0}
          aria-label={`Previous ${ariaLabel.toLowerCase()}`}
        >
          <Icon name="arrow-left" />
        </Button>
        <ButtonGroupSeparator />
        <Button
          variant="secondary"
          type="button"
          size="icon-lg"
          onClick={() => move(1)}
          disabled={options.length === 0}
          aria-label={`Next ${ariaLabel.toLowerCase()}`}
        >
          <Icon name="arrow-right" />
        </Button>
      </ButtonGroup>

      <div className="rotating-filter__dropdown" ref={popupRef}>
        <Button
          variant="secondary"
          type="button"
          size="lg"
          onClick={() => setIsPopupOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isPopupOpen}
        >
          {label}
        </Button>

        {isPopupOpen && (
          <div role="listbox" className="rotating-filter__listbox">
            <Button
              type="button"
              variant={selected === null ? 'default' : 'secondary'}
              size="xs"
              role="option"
              aria-selected={selected === null}
              onClick={() => handleSelect(null)}
            >
              {allLabel}
            </Button>
            {options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={option === selected ? 'default' : 'secondary'}
                size="xs"
                role="option"
                aria-selected={option === selected}
                onClick={() => handleSelect(option)}
              >
                {startCase(option)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </fieldset>
  )
}

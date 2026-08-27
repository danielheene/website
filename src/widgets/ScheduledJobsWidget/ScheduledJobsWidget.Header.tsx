'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ButtonGroup'
import { Icon } from '@/components/Icon'

interface HeaderProps {
  queues: string[]
  selectedQueue: string | null
  onSelectQueue: (queue: string | null) => void
  onMoveQueue: (direction: 1 | -1) => void
}

const ALL_QUEUES_LABEL = 'All Queues'

export const Header = ({ queues, selectedQueue, onSelectQueue, onMoveQueue }: HeaderProps) => {
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

  const handleSelect = (queue: string | null) => {
    onSelectQueue(queue)
    setIsPopupOpen(false)
  }

  return (
    <>
      <div
        className={cn([
          'flex flex-col',
          'font-mono',
        ])}
      >
        <div className="text-xs md:text-sm lg:text-md text-muted-foreground">
          Scheduled Jobs Controls:
        </div>
        <span className="text-md md:text-lg lg:text-xl font-medium leading-none">
          {selectedQueue ?? ALL_QUEUES_LABEL}
        </span>
      </div>

      <div className="flex flex-row gap-2.5">
        <ButtonGroup>
          <Button
            variant="secondary"
            type="button"
            size="icon-lg"
            onClick={() => onMoveQueue(-1)}
            disabled={queues.length === 0}
            aria-label="Previous queue"
          >
            <Icon name="arrow-left" />
          </Button>
          <ButtonGroupSeparator />
          <Button
            variant="secondary"
            type="button"
            size="icon-lg"
            onClick={() => onMoveQueue(1)}
            disabled={queues.length === 0}
            aria-label="Next queue"
          >
            <Icon name="arrow-right" />
          </Button>
        </ButtonGroup>

        <div className="relative" ref={popupRef}>
          <Button
            variant="secondary"
            type="button"
            size="lg"
            onClick={() => setIsPopupOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isPopupOpen}
          >
            {selectedQueue ?? ALL_QUEUES_LABEL}
          </Button>

          {isPopupOpen && (
            <div
              role="listbox"
              className={cn([
                'absolute right-0 top-full mt-1 z-10',
                'flex flex-col gap-1',
                'bg-background border border-border p-2',
                'min-w-full',
              ])}
            >
              <Button
                type="button"
                variant={selectedQueue === null ? 'default' : 'secondary'}
                size="xs"
                role="option"
                aria-selected={selectedQueue === null}
                onClick={() => handleSelect(null)}
              >
                {ALL_QUEUES_LABEL}
              </Button>
              {queues.map((queue) => (
                <Button
                  key={queue}
                  type="button"
                  variant={selectedQueue === queue ? 'default' : 'secondary'}
                  size="xs"
                  role="option"
                  aria-selected={selectedQueue === queue}
                  onClick={() => handleSelect(queue)}
                >
                  {queue}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

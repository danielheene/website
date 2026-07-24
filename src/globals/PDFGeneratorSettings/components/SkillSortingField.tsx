'use client'

import { useCallback, useRef, useState } from 'react'
import type { JSONFieldClientComponent, JSONFieldClientProps } from 'payload'
import { DraggableSortable, DraggableSortableItem, fieldBaseClass, useField } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { ClassValue, cn } from '@/lib/cn'
import { SkillEntrySortable, SkillSorting, SkillTypeSortable } from '@/types/payload'

export const SkillSortingField: JSONFieldClientComponent = ({ path }: JSONFieldClientProps) => {
  const { value, setValue } = useField<SkillSorting>({
    path,
  })

  const [isSelected, setIsSelected] = useState<SkillTypeSortable | null>(null)

  const handleEntryMove = (sortableKey: keyof SkillSorting) => {
    return (selectedValue: SkillTypeSortable[] | SkillEntrySortable[]) => {
      setValue({
        ...value,
        [sortableKey]: selectedValue,
      })
    }
  }

  return (
    <div className={cn('grid grid-cols-2 gap-2 -mx-2')}>
      <Sortable<SkillTypeSortable>
        entries={value?.skillTypeSortable || []}
        handleEntryMove={handleEntryMove('skillTypeSortable')}
        selectedEntry={isSelected}
        setSelectedEntry={setIsSelected}
        className="p-2 w-full"
      />
      <Sortable<SkillEntrySortable>
        entries={value?.[isSelected?.id] || []}
        handleEntryMove={handleEntryMove(isSelected?.id)}
        className="p-2 w-full"
      />
    </div>
  )
}

export default SkillSortingField

type SortableProps<EntryType extends SkillTypeSortable | SkillEntrySortable> = {
  entries: EntryType[]
  handleEntryMove: (newEntries: EntryType[]) => void
  selectedEntry?: EntryType | null
  setSelectedEntry?: (entry: EntryType) => void
  className?: ClassValue
}

function Sortable<EntryType extends SkillTypeSortable | SkillEntrySortable>({
  entries,
  handleEntryMove,
  selectedEntry,
  setSelectedEntry = () => void 0,
  className,
}: SortableProps<EntryType>) {
  const droppableRef = useRef<HTMLDivElement | null>(null)
  const [pointerDown, setPointerDown] = useState<boolean>(false)
  const [isDraggingItem, setIsDraggingItem] = useState<string | null>(null)

  const moveArrayItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return
      if (fromIndex < 0 || fromIndex > entries.length - 1) return
      if (toIndex < 0 || toIndex > entries.length - 1) return

      const movedValue = entries[fromIndex]
      const arrayExcludingMoved = entries.toSpliced(fromIndex, 1)
      const arrNewValuePos = arrayExcludingMoved.toSpliced(toIndex, 0, movedValue)

      handleEntryMove(arrNewValuePos)
    },
    [
      entries,
      handleEntryMove,
    ],
  )

  const handleDragStart = useCallback(({ event: _event, id }) => {
    setIsDraggingItem(id)
  }, [])

  const handleDragEnd = useCallback(
    ({ event: _event, moveFromIndex, moveToIndex }) => {
      moveArrayItem(moveFromIndex, moveToIndex)
      setIsDraggingItem(null)
    },
    [
      moveArrayItem,
    ],
  )

  return (
    <div
      className={cn([
        'border-2 border-transparent rounded',
        (pointerDown || isDraggingItem) && 'border-border',
        className,
      ])}
      onPointerDown={() => setPointerDown(true)}
      onPointerUp={() => setPointerDown(false)}
    >
      <DraggableSortable
        ids={entries.map(({ id }) => id)}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        droppableRef={droppableRef}
        className={cn([
          fieldBaseClass,
          'skill-sort',
          'flex flex-col gap-2',
        ])}
      >
        {entries.map((entry, index) => {
          const { id, label } = entry
          return !label && !id ? null : (
            <DraggableSortableItem key={index} id={id}>
              {({ isDragging, attributes, listeners, setNodeRef, transform }) => (
                <Button
                  id={id}
                  ref={setNodeRef}
                  {...attributes}
                  {...listeners}
                  role="draggable"
                  size="lg"
                  variant="outline"
                  type="button"
                  className={cn([
                    'w-full',
                    'grow-0 shrink-0',
                    'select-none',
                    'cursor-grab',
                    (pointerDown || isDragging) && 'z-50 cursor-grabbing',
                    selectedEntry?.id === id && 'bg-accent',
                  ])}
                  style={{
                    transform,
                  }}
                  onPointerDown={() => setSelectedEntry(entry)}
                >
                  <span className="max-w-full text-ellipsis overflow-hidden">{label}</span>
                </Button>
              )}
            </DraggableSortableItem>
          )
        })}
      </DraggableSortable>
    </div>
  )
}

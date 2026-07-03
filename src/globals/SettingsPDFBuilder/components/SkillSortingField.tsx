'use client'

import { DraggableSortable, DraggableSortableItem, fieldBaseClass, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent, JSONFieldClientProps } from 'payload'
import { useCallback, useRef, useState } from 'react'

import { Button } from '@/components/Button'
import { ClassValue, cn } from '@/lib/cn'

import { SkillEntrySortable, SkillSorting, SkillTypeSortable } from '../shared'

export const SkillTypeSortingField: JSONFieldClientComponent = ({ path }: JSONFieldClientProps) => {
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
    <div className={cn('grid grid-cols-2 gap-2')}>
      <Sortable<SkillTypeSortable>
        entries={value?.SkillTypeSortable || []}
        handleEntryMove={handleEntryMove('SkillTypeSortable')}
        selectedEntry={isSelected}
        setSelectedEntry={setIsSelected}
        className={cn('w-full')}
      />

      <Sortable<SkillEntrySortable>
        entries={value?.[isSelected?.id] || []}
        handleEntryMove={handleEntryMove(isSelected?.id)}
        className={cn('w-full')}
      />
    </div>
  )
}

export default SkillTypeSortingField

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

  const handleDragStart = useCallback(({ event, id }) => {
    console.log(`Started dragging item at index ${id}`, event)
  }, [])

  const handleDragEnd = useCallback(
    ({ event, moveFromIndex, moveToIndex }) => {
      console.log(`Moved item from index ${moveFromIndex} to index ${moveToIndex}`, event)
      moveArrayItem(moveFromIndex, moveToIndex)
    },
    [
      moveArrayItem,
    ],
  )

  return (
    <DraggableSortable
      ids={entries.map(({ id }) => id)}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      droppableRef={droppableRef}
      className={cn([
        fieldBaseClass,
        'skill-sort',
        'flex flex-col gap-2 w-full',
        className,
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
                  'user-select-none',
                  'cursor-grab',
                  isDragging && 'z-50 cursor-grabbing',
                  selectedEntry?.id === id && 'bg-accent',
                ])}
                style={{
                  transform,
                }}
                onClick={() => setSelectedEntry(entry)}
              >
                <span className="max-w-full text-ellipsis overflow-hidden">{label}</span>
              </Button>
            )}
          </DraggableSortableItem>
        )
      })}
    </DraggableSortable>
  )
}

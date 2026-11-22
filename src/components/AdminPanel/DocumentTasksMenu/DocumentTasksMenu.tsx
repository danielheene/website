'use client'

import { useCallback, useState } from 'react'
import {
  CheckboxInput,
  ConfirmationModal,
  PopupList,
  toast,
  useDocumentInfo,
  useModal,
} from '@payloadcms/ui'

import {
  enqueueCollectionTaskAction,
  enqueueDocumentTaskAction,
} from '@/lib/actions/enqueueDocumentTasks'
import { DOCUMENT_TASK_DEFINITIONS, type DocumentTask } from '@/lib/documentTasks/definitions'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

import './DocumentTasksMenu.styles.css'

type DocumentTasksMenuProps = {
  collection: string
  tasks: DocumentTask[]
  /** `document`: the edit view's menu, for the open document; `collection`: the list view's, for all. */
  scope: 'document' | 'collection'
}

type TaskItemProps = Omit<DocumentTasksMenuProps, 'tasks'> & {
  task: DocumentTask
  id: string | number | undefined
}

const TaskItem = ({ collection, scope, task, id }: TaskItemProps) => {
  const { openModal } = useModal()
  const { label, description, steps } = DOCUMENT_TASK_DEFINITIONS[task]
  const [selected, setSelected] = useState<string[]>(() => steps.map(({ name }) => name))
  const modalSlug = `document-task-${scope}-${task}`

  const toggle = (step: string) =>
    setSelected((current) =>
      current.includes(step) ? current.filter((name) => name !== step) : [...current, step],
    )

  const enqueue = useCallback(async () => {
    if (steps.length > 0 && selected.length === 0) {
      toast.error('Pick at least one step.')

      return
    }

    try {
      const { jobId } =
        scope === 'document'
          ? await enqueueDocumentTaskAction({
              task,
              collection,
              id: String(id),
              steps: selected,
            })
          : await enqueueCollectionTaskAction({
              task,
              collection,
              steps: selected,
            })

      toast.success(`${label}: queued`, {
        description: `Job ${jobId}. Progress and result are in Payload Jobs.`,
      })
    } catch (error) {
      toast.error(extractErrorMessage(error))
    }
  }, [collection, id, label, scope, selected, steps.length, task])

  return (
    <>
      <PopupList.Button onClick={() => openModal(modalSlug)}>
        {scope === 'collection' ? `${label} for all…` : `${label}…`}
      </PopupList.Button>
      <ConfirmationModal
        modalSlug={modalSlug}
        heading={scope === 'collection' ? `${label} for every document?` : `${label}?`}
        body={
          <div className="document-tasks-menu__body">
            <p>
              {description}
              {scope === 'collection' && ' Queues one job per document.'}
            </p>
            {steps.length > 0 && (
              <div className="document-tasks-menu__steps">
                {steps.map(({ name, label: stepLabel }) => (
                  <CheckboxInput
                    key={name}
                    id={`${modalSlug}-${name}`}
                    checked={selected.includes(name)}
                    label={stepLabel}
                    onToggle={() => toggle(name)}
                  />
                ))}
              </div>
            )}
          </div>
        }
        confirmLabel="Run"
        cancelLabel="Cancel"
        onConfirm={enqueue}
      />
    </>
  )
}

/**
 * The document tasks of a collection (`src/lib/documentTasks/`) as list- and edit-menu items, each
 * confirming with a modal that offers the task's steps. Mounted by `documentTasksPlugin`.
 */
export const DocumentTasksMenu = ({ collection, tasks, scope }: DocumentTasksMenuProps) => {
  const { id } = useDocumentInfo()

  // the edit view of a document that isn't saved yet has nothing to run on
  if (scope === 'document' && !id) return null

  return (
    <>
      {tasks.map((task) => (
        <TaskItem key={task} collection={collection} scope={scope} task={task} id={id} />
      ))}
    </>
  )
}

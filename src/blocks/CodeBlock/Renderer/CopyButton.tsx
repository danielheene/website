'use client'

import { useState } from 'react'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'

import { Button } from '@/components/Button'
import { UmamiEvent } from '@/lib/umami/events'
import { track } from '@/lib/umami/track'

export function CopyButton({ code, language }: { code: string; language?: string }) {
  const [text, setText] = useState('Copy')

  function updateCopyStatus() {
    if (text === 'Copy') {
      setText(() => 'Copied!')
      setTimeout(() => {
        setText(() => 'Copy')
      }, 1000)
    }
  }

  return (
    <div className="flex justify-end align-middle">
      <Button
        variant="secondary"
        size="sm"
        type="button"
        className="flex gap-1"
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
          track(UmamiEvent.CodeCopy, { language: language ?? 'plain' })
        }}
      >
        <CopyIcon />
      </Button>
    </div>
  )
}

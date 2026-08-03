'use client'

import { useState } from 'react'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'

import { Button } from '@repo/ui/Button'

export function CopyButton({ code }: { code: string }) {
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
        color="secondary"
        size="sm"
        type="button"
        className="flex gap-1"
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        }}
      >
        <CopyIcon />
      </Button>
    </div>
  )
}

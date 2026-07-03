'use client'

import { CopyIcon } from '@payloadcms/ui/icons/Copy'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

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
        size="icon-sm"
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

'use client'

import { useState } from 'react'

import { cn } from 'tailwind-variants'

import { Icon } from '@/components/Icon'

export interface ChecksumEntry {
  locale: string
  label: string
  checksum: string
}

/**
 * Truncates a hex checksum to `first…last` for compact display, e.g.
 * `a1b2c3…f9e8d7`. Copy-to-clipboard still copies the full value.
 */
const truncateChecksum = (checksum: string, edge = 8): string =>
  checksum.length <= edge * 2 + 1 ? checksum : `${checksum.slice(0, edge)}…${checksum.slice(-edge)}`

export const ChecksumRow = ({ label, checksum }: ChecksumEntry) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checksum)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail (permissions, insecure context); the
      // checksum is still visible/selectable, so this is a soft failure.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={checksum}
      aria-label={`Copy ${label} checksum`}
      className={cn([
        'group flex items-center gap-2 self-center text-xs',
        'cursor-pointer opacity-70 hover:opacity-100 transition-opacity',
      ])}
    >
      <span className="font-mono tabular-nums">sha256:{truncateChecksum(checksum)}</span>
      <Icon
        name={copied ? 'material-symbols:check' : 'material-symbols:content-copy-outline'}
        className="text-sm opacity-60 group-hover:opacity-100"
      />
      <span className="sr-only" aria-live="polite">
        {copied ? 'Checksum copied to clipboard' : undefined}
      </span>
    </button>
  )
}

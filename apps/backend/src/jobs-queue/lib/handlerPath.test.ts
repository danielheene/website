import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { handlerPath } from './handlerPath'

describe('handlerPath', () => {
  it('points at the handler module, with the export name Payload expects', () => {
    expect(handlerPath('heartbeatPing.ts')).toBe(
      `${path.resolve('src/jobs-queue/handlers/heartbeatPing.ts')}#handler`,
    )
  })

  it('is absolute, because Payload resolves relative paths against its own package', () => {
    expect(path.isAbsolute(handlerPath('generateResumeFile.tsx').split('#')[0])).toBe(true)
  })
})

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Reads the registry as text: importing the migration modules would load the
// whole Payload config graph, which this check does not need.
const MIGRATION_FILE = /^(\d{8})_[a-z0-9_]+\.ts$/

const files = readdirSync(__dirname)
  .filter((file) => MIGRATION_FILE.test(file))
  .map((file) => path.basename(file, '.ts'))
  .sort()

const registry = readFileSync(path.join(__dirname, 'index.ts'), 'utf8')
const registeredNames = [
  ...registry.matchAll(/name: '([^']+)'/g),
].map(([, name]) => name)
const importedFiles = [
  ...registry.matchAll(/from '\.\/([^']+)'/g),
].map(([, file]) => file)

describe('migrations registry', () => {
  it('registers every migration file, in order', () => {
    expect(registeredNames).toEqual(files)
  })

  it('imports every migration file', () => {
    expect(importedFiles).toEqual(files)
  })

  it('numbers migrations uniquely and contiguously from 1', () => {
    const numbers = files.map((file) => Number(file.slice(0, 8)))
    expect(numbers).toEqual(numbers.map((_, index) => index + 1))
  })
})

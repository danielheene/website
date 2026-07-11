import { loadEnvConfig } from '@next/env'
import path from 'node:path'

export function loadRootEnv(dir: string) {
  loadEnvConfig(path.resolve(dir, '..'))
}

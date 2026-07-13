import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadEnvConfig } from '@next/env'
import { resolveWorkspaceRoot } from 'resolve-workspace-root'
import z from 'zod'

import { Env, envSchema } from '@/types/environment'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const loadEnv = async (directory?: string | undefined): Promise<Env | undefined> => {
  const envDirectory = directory || resolveWorkspaceRoot(dirname)
  const loadedDirectory = loadEnvConfig(envDirectory, process.env.NODE_ENV !== 'production')

  const parsedEnv = envSchema.safeParse(loadedDirectory.parsedEnv)
  if (!parsedEnv.success) {
    console.error(`\n${z.prettifyError(parsedEnv.error)}\n`)
    process.exit(1)
  }

  return parsedEnv.data
}

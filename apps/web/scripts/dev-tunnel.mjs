#!/usr/bin/env node

import { spawn } from 'node:child_process'

const PORT = process.env.PORT ?? '3000'
const TUNNEL_TIMEOUT_MS = 30_000
const TRY_CLOUDFLARE_URL = /(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/

const tunnel = spawn('cloudflared', ['tunnel', '--no-autoupdate', '--url', `http://localhost:${PORT}`], {
  stdio: ['ignore', 'pipe', 'pipe'],
})

let nextProc = null
let tunnelUrl = null
let shuttingDown = false

const startNext = (url) => {
  const hostname = new URL(url).hostname
  nextProc = spawn('next', ['dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NEXT_PUBLIC_SERVER_HOST: hostname,
      NEXT_PUBLIC_SERVER_URL: url,
      PORT,
    },
  })

  nextProc.stdout?.on('data', (chunk) => {
    const text = chunk.toString()

    for (const line of text.split('\n')) {
      process.stdout.write(`[next] ${line}\n`)
      if (line.includes('Network:')) {
        const tunnelInfo = line.slice(0, line.indexOf('http')).replace('Network', 'Tunnel') + ` ${url}`
        process.stdout.write(`[next] ${tunnelInfo}\n`)
      }
    }
  })

  nextProc.stderr?.on('data', (chunk) => {
    const text = chunk.toString()

    for (const line of text.split('\n')) {
      process.stderr.write(`[next] ${line}\n`)
    }
  })

  nextProc.on('exit', (code) => {
    shutdown(code ?? 0)
  })
}


const onTunnelOutput = (chunk) => {
  const text = chunk.toString()
  if (!tunnelUrl) {
    const match = text.match(TRY_CLOUDFLARE_URL)
    if (match) {
      tunnelUrl = match[1]
      startNext(tunnelUrl)
    }
  }
  for (const line of text.split('\n')) {
    if (/\b(ERR|WRN|FTL|PNC)\b/.test(line)) {
      process.stderr.write(`[cloudflared] ${line}\n`)
    }
  }
}

tunnel.stdout?.on('data', onTunnelOutput)
tunnel.stderr?.on('data', onTunnelOutput)

tunnel.on('exit', (code) => {
  if (!shuttingDown) {
    console.error(`\n[tunnel] cloudflared exited unexpectedly (code ${code})`)
    shutdown(code ?? 1)
  }
})

const timeout = setTimeout(() => {
  if (!tunnelUrl) {
    console.error(`\n[tunnel] timed out after ${TUNNEL_TIMEOUT_MS / 1000}s waiting for tunnel URL`)
    shutdown(1)
  }
}, TUNNEL_TIMEOUT_MS)

function shutdown(code) {
  if (shuttingDown) return
  shuttingDown = true
  clearTimeout(timeout)
  nextProc?.kill('SIGTERM')
  tunnel.kill('SIGTERM')
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

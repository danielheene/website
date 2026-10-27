import { defineConfig } from 'deepsec/config'

import { generatedMatchersPlugin } from './generated-matchers.js'

export default defineConfig({
  defaultThinkingLevel: 'xhigh', // <deepsec:default-thinking-level>
  defaultModel: 'gpt-5.6-sol', // <deepsec:default-model>
  defaultAgent: 'codex', // <deepsec:default-agent>
  ai: { mode: 'gateway', provider: 'vercel' }, // <deepsec:model-route>
  projects: [
    { id: 'website-develop', root: '..' },
    // <deepsec:projects-insert-above>
  ],
  plugins: [generatedMatchersPlugin],
})

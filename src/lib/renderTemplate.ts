'use server'

import {
  type RenderTemplateArgs,
  type RenderTemplateError,
  type RenderTemplateResult,
  renderTemplateCore,
} from './renderTemplate.core'

export type { RenderTemplateArgs, RenderTemplateError, RenderTemplateResult }

/**
 * Server-action entry point for template rendering.
 *
 * The implementation lives in `renderTemplate.core.ts` because a `'use
 * server'` module exports only actions, and Payload field hooks must not
 * depend on those. Callers that already hold a `PayloadRequest` should use
 * `renderTemplateCore` directly to get the per-request globals cache.
 */
export const renderTemplate = async (
  args: RenderTemplateArgs,
): Promise<RenderTemplateError | RenderTemplateResult> => renderTemplateCore(args)

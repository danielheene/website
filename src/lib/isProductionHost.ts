/**
 * Whether this process serves the production site.
 *
 * `NODE_ENV` cannot answer that: every deployed image runs in production mode,
 * the development environment included. An unset `PRODUCTION_HOST` reads as
 * "not production", so a misconfigured environment fails closed.
 */
export const isProductionHost = (): boolean =>
  Boolean(process.env.PRODUCTION_HOST) && process.env.SERVER_HOST === process.env.PRODUCTION_HOST

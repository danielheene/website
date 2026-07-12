# External Integrations

## Core Sections (Required)

### 1) Integration Inventory

| System | Type (API/DB/Queue/etc) | Purpose | Auth model | Criticality | Evidence |
|--------|---------------------------|---------|------------|-------------|----------|
| MongoDB | Database | Primary Payload CMS datastore | Connection string (`DATABASE_URL`) | High | `web/payload.config.ts:170-172`, `docker-compose.yml` (mongo service) |
| Redis | KV store / cache | Payload's `kv` adapter (session/cache-style storage) | Connection string (`REDIS_URL`) | High | `web/payload.config.ts:218-220` |
| S3-compatible storage (local: `rustfs`, prod target unspecified) | Object storage | Media/document/audio/video uploads via Payload's S3 storage plugin | Access/secret key pair (`S3_ACCESS_KEY`/`S3_SECRET_KEY`) | High | `web/payload.config.ts:246-276`, `docker-compose.yml` (storage + create-bucket services) |
| UseSend | Email API | Transactional email sending (custom Payload email adapter) | API key (`USESEND_API_KEY`) | Medium | `web/payload.config.ts:176-181`, `web/src/lib/useSendAdapter.ts` (referenced) |
| Umami | Analytics | Pageview/event analytics, proxied through `/stats/*` rewrite; also surfaced as admin dashboard widgets | Username/password + site ID env vars | Low/Medium | `web/next.config.ts:150-155`, `web/payload.config.ts:39-102` (Umami admin widgets), `web/src/contexts/Umami`, `web/src/contexts/UmamiCharts` |
| Anthropic (Claude) | LLM API | Auto-generates image alt text and meta descriptions for media/pages | API key (`ANTHROPIC_API_KEY`) | Medium | `web/src/lib/fetchAnthropicImageAltText.ts`, `web/src/lib/fetchAnthropicMetaDescription.ts`, `@ai-sdk/anthropic` dep |
| Uptime Kuma (external status page) | API (heartbeat feed) | Powers the `/api/service-status` endpoint showing overall system status | Public heartbeat URL, no auth | Low | `web/app/(frontend)/api/service-status/route.ts`, `web/src/types/uptime-kuma.ts` |
| Sentry | Error monitoring (dependency present, **not actively wired**) | Intended error/performance monitoring | DSN (`SENTRY_DSN`, referenced but env schema has it commented out) | N/A (dormant) | `web/next.config.ts:100`, `web/payload.config.ts:240-245` (plugin import commented out), `web/src/types/environment.ts:40-43` (SENTRY_* vars commented out of the zod schema) |
| Cloudflare (tunnel + Workers CLI) | Dev tooling / possible deploy target | `wrangler` dependency + `scripts/dev-tunnel.mjs` spawn a `cloudflared` quick tunnel for local dev exposure | Tunnel token (optional: `CLOUDFLARE_TUNNEL_*`) | Low | `scripts/dev-tunnel.mjs`, `web/src/types/environment.ts:49-51` |
| OpenAI / Mapbox | API keys present in env schema, **no call sites found** | **[TODO]** — unclear current usage | API key | Unknown | `web/src/types/environment.ts:45,47` (`OPENAI_API_KEY`, `MAPBOX_API_KEY`) |

### 2) Data Stores

| Store | Role | Access layer | Key risk | Evidence |
|-------|------|--------------|----------|----------|
| MongoDB | System of record for all CMS content (collections, globals, jobs queue records) | `@payloadcms/db-mongodb` (`mongooseAdapter`), accessed only through Payload's local API/collections — no direct Mongoose model access found outside Payload | Single Mongo instance in dev compose (no replica set) — **[TODO]** confirm production topology/backup strategy | `web/payload.config.ts:170-172` |
| Redis | Payload KV adapter backing store | `@payloadcms/kv-redis` | `redis-server --maxmemory-policy noeviction` in dev compose — no eviction could exhaust memory if unbounded keys accumulate | `docker-compose.yml` (redis service), `web/payload.config.ts:218-220` |
| S3-compatible object storage | Binary asset storage (images/video/audio/documents/resume files) | `@payloadcms/storage-s3` plugin, `clientUploads: true` (browser uploads directly to storage), `disableLocalStorage: true` | Bucket policy in dev sets **public download** access (`mc anonymous set download`, `docker-compose.yml`) — **[ASK USER]** confirm the production bucket policy matches intent (public-read is appropriate for a personal site's media, but should be a deliberate choice, not a dev-only default carried into prod) | `web/payload.config.ts:246-276`, `docker-compose.yml` (create-bucket service) |

### 3) Secrets and Credentials Handling

- Credential sources: exclusively environment variables, loaded from root `.env`/`.env.local` and validated by a single `zod` schema (`web/src/types/environment.ts`) before the app or Payload CLI proceeds (`web/env.ts:22-26`).
- Hardcoding check: no hardcoded API keys/secrets found in source; `S3_ACCESS_KEY`/`S3_SECRET_KEY` default to `minioadmin`/`minioadmin` only in the **example** file (`.env.example:15-16`), which is standard for local dev.
- Rotation/lifecycle notes: **[TODO]** — no rotation tooling or secrets-manager integration found; secrets are managed manually via `.env.local` (untracked, per `.gitignore`).

### 4) Reliability and Failure Behavior

- Retry/backoff behavior: **not implemented** for external API calls found (`fetchAnthropicImageAltText.ts`, `fetchAnthropicMetaDescription.ts`, the Uptime Kuma heartbeat fetch) — a single `fetch()` with try/catch, no retry loop.
- Timeout policy: **[TODO]** — no explicit `AbortController`/timeout configuration found on the reviewed `fetch()` calls (e.g. `web/app/(frontend)/api/service-status/route.ts:25-27`).
- Circuit-breaker/fallback behavior: the `service-status` route degrades gracefully by returning a 500 with a plain message if `STATUS_PAGE_HEARTBEAT_URL` is unset or the fetch throws (`web/app/(frontend)/api/service-status/route.ts:16-21,39-44`) — the only fallback pattern observed.

### 5) Observability for Integrations

- Logging around external calls: minimal — `console.info`/`console.error` around the status-page fetch only (`web/app/(frontend)/api/service-status/route.ts:24,34,40`). No equivalent logging observed around the Anthropic or UseSend calls (**[TODO]** verify).
- Metrics/tracing coverage: none beyond Umami pageview analytics (which measures site traffic, not integration health) and the dormant Sentry dependency.
- Missing visibility gaps: no APM/tracing for MongoDB, Redis, or S3 calls; no alerting if the Anthropic API or UseSend email provider fails silently in a Payload hook.

### 6) Evidence

- `web/payload.config.ts`
- `web/src/types/environment.ts`, `.env.example`
- `docker-compose.yml`
- `web/app/(frontend)/api/service-status/route.ts`
- `web/src/lib/fetchAnthropicImageAltText.ts`, `web/src/lib/fetchAnthropicMetaDescription.ts`

## Extended Sections (Optional)

Not populated — no formal SLA/SLO or multi-region failover topology exists for this personal-site-scale project.

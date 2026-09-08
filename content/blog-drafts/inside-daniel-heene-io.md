---
title: "Inside daniel.heene.io: How a Personal Site Became a Full Payload + Next.js Platform"
description: "A technical walkthrough of daniel.heene.io's architecture — Next.js 16 and Payload CMS 3 on MongoDB and Redis, a background job worker that generates localized resume PDFs, and a self-hosted deployment pipeline running on Dokploy."
date: "2026-09-08"
lastUpdated: "2026-09-08"
author: "Daniel Heene"
tags: ["nextjs", "payload-cms", "web-development", "self-hosted", "typescript"]
status: "draft"
---

> **Key Takeaways**
> - The site runs Next.js 16 (App Router, React 19, Cache Components enabled) with Payload CMS 3 as an embedded, code-first CMS — one Next.js app, no separate backend.
> - MongoDB holds content, Redis backs Payload's KV cache and jobs queue, and a Redis pub/sub channel powers Server-Sent Events for live status updates — there is no Next.js cache handler on Redis.
> - A resume-builder feature generates localized, checksum-versioned PDF documents through a background job worker (`@react-pdf/renderer` + a dedicated Payload jobs queue), decoupled from the web process.
> - Deployment is self-hosted: GitHub Actions builds three Docker images (app, worker, Storybook) and hands them to Dokploy, with Doppler distributing secrets to both CI and the server.
> - Sentry, Umami analytics, and a public status page round out observability — all optional and inert until their environment variables are set.

## Why Rebuild a Personal Site as a Platform?

Most personal sites are a handful of static pages. daniel.heene.io is that too — but underneath, it's a content platform: a blog with localized posts, a CMS-driven page builder, and a resume generator that assembles a PDF on demand from structured data instead of a static file sitting in `/public`. The interesting engineering isn't the marketing copy on the homepage; it's the plumbing that makes editing content, generating documents, and shipping changes fast and boring.

This post walks through that plumbing: the framework choices, how content and jobs flow through the system, and the infrastructure that keeps it running in production.

## The Core Stack: Next.js 16 and an Embedded Payload CMS

The site is a single Next.js 16 application using the App Router, React 19, and — notably — Next's `cacheComponents` flag turned on. That last part matters more than it looks: with Cache Components enabled, nearly every route gets a shell rendered at build time, which is why environment variables like `SERVER_URL` and the public Sentry DSN have to be correct *at build time*, not just at runtime — a server-side `process.env` read gets baked straight into that prerendered shell.

*(Related: a companion post on the Cache Components query-split pattern used to keep routes cacheable — link once that post exists.)*

Content lives in **Payload CMS 3**, configured directly in `payload.config.ts` at the repo root and wired into Next via `withPayload()` in `next.config.ts`. This isn't a headless CMS living on its own server — Payload's admin panel (`app/(payload)`) and the public frontend (`app/(frontend)`) are two route groups inside the same Next.js app, sharing the same process, the same database connection, and — deliberately — many of the same React components. The admin panel's stylesheet loads the site's own Tailwind theme, so buttons and icons in the CMS match the public site instead of looking like a bolted-on backend office.

```
app/
├── (frontend)/     # public site: pages, blog, resume download, api/preview, api/sse
└── (payload)/      # Payload admin panel — same app, same process
```

Data modeling follows Payload's usual shape: collections (`BlogPosts`, `Pages`, `Media`, `Users`, a family of `Resume*` collections), globals (`SiteSettings`, `PDFGeneratorSettings`), reusable field factories, and content blocks assembled through Payload's block system and rendered by Lexical-to-JSX conversion on the frontend.

## Where the Data Lives: MongoDB, Redis, and S3-Compatible Storage

Three storage systems do distinct jobs:

**MongoDB** (via Mongoose, `@payloadcms/db-mongodb`) is the primary datastore — every collection and every draft version. Payload's own document-level localization (`localization` in `payload.config.ts`) is deliberately turned **off**; the site handles bilingual content its own way (more on that below).

**Redis** isn't a Next.js cache layer here — there's no cache handler wired into `next.config.ts`. Its job is entirely on the Payload side, in two roles:
1. Payload's own KV adapter (`@payloadcms/kv-redis`), backing session state and the Payload **jobs queue** (the same queue the resume pipeline below runs on).
2. A custom pub/sub layer (`src/lib/RedisHandler.ts`) that backs a Server-Sent Events endpoint (`app/(frontend)/api/sse`) for real-time status updates — things like a scheduled-jobs admin widget that shows pending work and lets an operator trigger a run or cancel it live, without polling, and live progress for the AI-translate buttons described below.

**S3-compatible object storage** holds media. Locally that's a self-hosted RustFS/Minio container; in production it's Hetzner Object Storage, addressed through three regional endpoints (`fsn1`, `nbg1`, `hel1`). Every image uploaded through the media library automatically gets alt text and a `blurDataURL` placeholder generated with `sharp` — so editors never have to hand-write alt text for accessibility, and pages get an instant blurred preview before the full image loads.

## The Resume Builder: A Background Job Pipeline for Generated PDFs

The most distinctive feature on the site isn't a blog post — it's a resume that isn't a static PDF at all. It's generated.

Treating a downloadable résumé as a *build artifact* rather than a static file changes the engineering problem entirely. A résumé needs to render consistently in a specific language, reflect the latest content edited in the CMS, and be re-generatable without a deploy. That means: structured content in the CMS, a rendering pipeline that turns it into a PDF, and a way to trigger that rendering without blocking the web server.

The pipeline looks like this:

1. An editor updates resume content (work experience, skills, languages) as normal Payload collections and fields — not freeform text, but structured data with localization built in.
2. `buildLocalizedResumeData` assembles a single language's resume data from those collections into the shape the PDF renderer expects.
3. `enqueueGenerateResumeDocument` (a Payload server action) hands that job to Payload's **jobs queue**, rather than generating the PDF inline during the HTTP request.
4. A separate **worker process** — its own Docker image, running `pnpm run start:worker` — picks the job up and actually renders it.
5. The PDF itself is built with `@react-pdf/renderer`: the same component-based mental model as the web UI, but targeting a PDF document tree instead of the DOM (`src/pdf/components/*`, assembled in `src/pdf/index.tsx`).
6. Each generated document gets a **custom, checksum-derived ID** (`generateResumeDocumentCustomId`) and a stable **redirect URL** (`generateResumeDocumentRedirectURL`), so a download link keeps working even as new versions get generated behind it, and a `ResumeChecksumValidator` client component can detect when a newer version exists.

```
Editor saves resume content
        │
        ▼
buildLocalizedResumeData ──► enqueueGenerateResumeDocument (server action)
                                        │
                                        ▼
                              Payload Jobs Queue (Redis/Mongo-backed)
                                        │
                                        ▼
                         worker process (separate container)
                                        │
                                        ▼
                    @react-pdf/renderer → PDF → S3 storage
                                        │
                                        ▼
                     checksummed ID + redirect URL served at
                     app/(frontend)/download/resume.pdf
```

Why bother separating this into a worker at all, rather than generating the PDF inside the download route? Because PDF rendering is comparatively slow and CPU-bound, and doing it inline would tie up a web-serving process on every download request. Running it as a queued job on a dedicated worker container means the web tier stays fast and stateless, and the worker can be scaled or restarted independently — it shares the exact same build output as the app image (the `Dockerfile`'s `worker` target reuses the `app` target's compiled `.next` output, it just boots a different entrypoint against it).

An admin-panel widget (`ScheduledJobsWidget`) surfaces every pending job — run-now and cancel actions wired live over the same SSE channel described above, so an operator watches a resume regenerate in real time instead of refreshing a queue table.

## Bilingual Content Without Payload Localization

Payload's built-in per-document localization is switched off (`localization: false` in `payload.config.ts`) — this isn't a site where every collection has an `en`/`de` copy negotiated by locale. Blog posts, for instance, aren't localized at all.

Where bilingual content genuinely matters — resume content, mainly — the site uses its own pattern instead: a **`BilingualRichTextField`**, a reusable Payload group field that renders English and German rich-text editors side by side in the same document, with two AI-translate buttons between them. Translation round-trips through HTML via **Claude** (`fetchAnthropicTranslation`), triggered two ways:

- **Auto mode** — a background job (`autoTranslateBilingualField`, run on the same Payload jobs queue as the resume PDF pipeline) fires after a save where one side is newly populated and the other is still empty, and patches the document directly once translation finishes.
- **Manual mode** — a user clicks a translate button while the admin tab is open; progress and the final value stream back over the same Redis-backed SSE channel used elsewhere in the admin, and the client applies the result to the unsaved form via `setValue` rather than touching the document, so it can't clobber whatever else the user is mid-typing.

The docstring on that field is refreshingly upfront about where this breaks: blocks and tables from the richer editor variants can degrade to plain-text paragraphs on the round trip, and **links are not preserved by translation in any variant** — the custom fields this codebase's link nodes carry can't be reconstructed from a plain HTML `<a>` by the parser, so linked content has to be translated by hand.

Resume PDF generation is separately per-language (`buildLocalizedResumeData` takes a locale), which is what actually produces an English or German PDF — a distinct concern from the bilingual-field editing pattern above. Every one of the site's AI content helpers — this translation feature, generated image alt text, excerpts, and meta descriptions — runs on **Claude** via the AI SDK's Anthropic provider (`@ai-sdk/anthropic`), not on article copy.

## Observability: Sentry, Umami, and a Public Status Page

Three systems watch the site in production, and all three are designed to be **silently absent** in development:

- **Sentry** (`@sentry/nextjs`) captures errors, traces, Web Vitals, and optional session replay — but the SDK is never initialized unless `SENTRY_DSN` is set, so a developer running locally without Sentry credentials sees no behavior change at all. In production, Sentry requests are proxied through a `/monitoring` route specifically so ad blockers can't silently drop error reports, and uploaded source maps are deleted immediately after the upload completes so they're never served publicly. Releases are tagged to match the exact version semantic-release just cut, so a Sentry issue can be traced to the commit that introduced it.
- **Umami** provides privacy-respecting analytics, proxied through a same-origin `/stats/*` rewrite (configured conditionally in `next.config.ts` — the rewrite only exists at all if `NEXT_PUBLIC_UMAMI_URL` is set) so analytics traffic doesn't get blocked as an obvious third-party tracker, and an admin widget pulls the same stats server-side for an at-a-glance dashboard.
- A **status page** URL and heartbeat endpoint are wired through `SERVER_URL`-adjacent environment variables and surfaced in the site footer via a `ServiceStatus` component, giving visitors (and the site owner) a public signal of uptime independent of the app itself.

## Shipping It: Docker, GitHub Actions, and Dokploy

There's no cloud PaaS auto-deploy here — the site is self-hosted, and the deployment pipeline reflects that choice deliberately.

One Dockerfile produces **three images** from a single build context: `app` (the Next.js server), `worker` (the same build output, running the job-queue worker instead), and `storybook` (the component library, built independently since it needs neither a database nor Tailscale connectivity). The app and worker images share a builder stage — the build only runs once — while Storybook builds separately because rendering component stories doesn't need any of Payload's runtime dependencies.

Because `generateStaticParams()` calls `payload.find()` during the Next.js build (several routes are statically generated from CMS content), the build step needs a **reachable database** — which means the CI runner joins the private network over Tailscale for that step alone, using the `tailscale/github-action`. Build-time secrets arrive as a single BuildKit secret file rather than as Docker build args or `ENV` instructions, specifically so they never get cached into an image layer or become visible via `docker history`.

```
git push → main/develop
        │
        ▼
GitHub Actions (ci-release.yml)
   ├─ semantic-release (main only) → version bump, tag, changelog
   ├─ Tailscale join → docker build (app / worker / storybook)
   │        └─ build_env secret file (BuildKit secret mount)
   ├─ push images → ghcr.io/danielheene/website/{app,worker,storybook}
   └─ trigger Dokploy redeploy
                │
                ▼
     Dokploy pulls image, restarts containers
     (env supplied directly by Dokploy, synced from Doppler)
```

A single workflow file covers both pull requests (lint + unit tests only — nothing built or pushed) and pushes to `main` or `develop` (full build-and-deploy, no separate promotion step). `main` produces `:latest` and, once semantic-release has cut a release, a matching `:vX.Y.Z` tag; `develop` produces a rolling `:edge` tag. There's deliberately no SHA-based tagging scheme — the branch itself is the deployment identity.

**Doppler** is the single source of truth for configuration and secrets, syncing into the same GitHub Environments (`Production`, `Development`) that the build job binds to, and into the Dokploy server directly — so a secret rotated in Doppler reaches both CI and the running containers without a separate manual step in either place.

*(Related: a follow-up post on choosing Dokploy over a managed platform for a self-hosted Next.js + Payload app — link once that post exists.)*

## Code Quality: Biome, Husky, and a Single CI Gate

Linting and formatting run through **Biome**, not ESLint/Prettier — a single fast tool covering both jobs. Husky installs a `pre-commit` hook (running `lint-staged` → `biome check --write` against staged files only, auto-fixing and re-staging) and a `commit-msg` hook enforcing Conventional Commits, both wired up automatically the moment `pnpm install` runs. The same commit-message check runs again in CI, so a `--no-verify` bypass locally still has to pass before a pull request can merge.

Testing is split cleanly by speed and scope: **Vitest** for unit tests (mocking Payload and stubbing environment variables, so the suite needs no database, no VPN, no secrets at all) and **Playwright** for end-to-end smoke tests against a real dev server backed by Docker Compose (MongoDB, Redis, S3-compatible storage). Because the site is entirely CMS-driven, the E2E suite deliberately asserts *structural* health — pages render, key routes respond — rather than asserting specific content, since content is expected to change independently of code.

## The Architecture at a Glance

<figure>
<svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="arch-title arch-desc" style="max-width:100%;height:auto;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
<title id="arch-title">System architecture of daniel.heene.io</title>
<desc id="arch-desc">A Next.js 16 application with an embedded Payload CMS talks to MongoDB, Redis, and S3-compatible storage. A separate worker container consumes a jobs queue to render resume PDFs. GitHub Actions builds three Docker images and triggers Dokploy, which redeploys the app, worker, and Storybook containers. Sentry, Umami, and a status page provide observability, all optional.</desc>
<defs>
<style>
  .box { fill: #ffffff; stroke: #94a3b8; stroke-width: 1.5; rx: 10; }
  .box-accent { fill: #eef2ff; stroke: #6366f1; stroke-width: 1.5; rx: 10; }
  .box-worker { fill: #fef3f2; stroke: #ef4444; stroke-width: 1.5; rx: 10; }
  .box-obs { fill: #f0fdf4; stroke: #22c55e; stroke-width: 1.5; rx: 10; }
  .lbl { fill: #1e293b; font-size: 13px; font-weight: 600; }
  .sub { fill: #475569; font-size: 11px; }
  .grp { fill: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  .edge { stroke: #94a3b8; stroke-width: 1.5; fill: none; marker-end: url(#arrow); }
</style>
<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/>
</marker>
</defs>

<rect x="20" y="20" width="860" height="100" class="box-accent"/>
<text x="40" y="42" class="grp">Next.js 16 application (single process)</text>
<rect x="40" y="55" width="250" height="50" class="box"/>
<text x="55" y="75" class="lbl">(frontend) route group</text>
<text x="55" y="92" class="sub">public site, blog, resume download, SSE</text>
<rect x="310" y="55" width="250" height="50" class="box"/>
<text x="325" y="75" class="lbl">(payload) route group</text>
<text x="325" y="92" class="sub">CMS admin panel, shared theme</text>
<rect x="580" y="55" width="280" height="50" class="box"/>
<text x="595" y="75" class="lbl">Payload CMS 3 core</text>
<text x="595" y="92" class="sub">collections, globals, blocks, jobs queue</text>

<rect x="20" y="150" width="270" height="90" class="box"/>
<text x="35" y="172" class="lbl">MongoDB</text>
<text x="35" y="190" class="sub">primary datastore</text>
<text x="35" y="206" class="sub">content, versions, locales</text>

<rect x="315" y="150" width="270" height="90" class="box"/>
<text x="330" y="172" class="lbl">Redis</text>
<text x="330" y="190" class="sub">KV cache · jobs queue</text>
<text x="330" y="206" class="sub">pub/sub → SSE endpoint</text>

<rect x="610" y="150" width="270" height="90" class="box"/>
<text x="625" y="172" class="lbl">S3-compatible storage</text>
<text x="625" y="190" class="sub">media, generated PDFs</text>
<text x="625" y="206" class="sub">3 regional endpoints</text>

<line x1="150" y1="105" x2="150" y2="150" class="edge"/>
<line x1="435" y1="105" x2="435" y2="150" class="edge"/>
<line x1="720" y1="105" x2="720" y2="150" class="edge"/>

<rect x="20" y="270" width="430" height="110" class="box-worker"/>
<text x="40" y="292" class="grp">Resume generation pipeline</text>
<text x="40" y="312" class="lbl">jobs queue → worker container</text>
<text x="40" y="330" class="sub">buildLocalizedResumeData → @react-pdf/renderer</text>
<text x="40" y="347" class="sub">checksummed ID + stable redirect URL</text>
<text x="40" y="364" class="sub">separate Docker image, shares build output with app</text>
<line x1="720" y1="240" x2="235" y2="270" class="edge"/>
<line x1="235" y1="380" x2="720" y2="240" class="edge" stroke-dasharray="4 3"/>

<rect x="470" y="270" width="410" height="110" class="box-obs"/>
<text x="490" y="292" class="grp">Observability (all optional)</text>
<text x="490" y="312" class="sub">Sentry — errors, traces, replay (inert w/o SENTRY_DSN)</text>
<text x="490" y="329" class="sub">Umami — privacy analytics via same-origin rewrite</text>
<text x="490" y="346" class="sub">Status page + heartbeat → footer widget</text>
<line x1="150" y1="240" x2="490" y2="290" class="edge" stroke-dasharray="4 3"/>

<rect x="20" y="410" width="860" height="130" class="box"/>
<text x="40" y="432" class="grp">Delivery pipeline</text>
<rect x="40" y="445" width="180" height="75" class="box-accent"/>
<text x="52" y="465" class="sub">GitHub Actions</text>
<text x="52" y="480" class="sub">lint + test (PRs)</text>
<text x="52" y="495" class="sub">build + release (push)</text>
<rect x="245" y="445" width="180" height="75" class="box-accent"/>
<text x="257" y="465" class="sub">Tailscale</text>
<text x="257" y="480" class="sub">private DB access</text>
<text x="257" y="495" class="sub">during image build</text>
<rect x="450" y="445" width="180" height="75" class="box-accent"/>
<text x="462" y="465" class="sub">ghcr.io</text>
<text x="462" y="480" class="sub">app / worker /</text>
<text x="462" y="495" class="sub">storybook images</text>
<rect x="655" y="445" width="205" height="75" class="box-accent"/>
<text x="667" y="465" class="sub">Dokploy</text>
<text x="667" y="480" class="sub">self-hosted redeploy</text>
<text x="667" y="495" class="sub">env synced from Doppler</text>
<line x1="220" y1="482" x2="245" y2="482" class="edge"/>
<line x1="425" y1="482" x2="450" y2="482" class="edge"/>
<line x1="630" y1="482" x2="655" y2="482" class="edge"/>
</svg>
<figcaption>System architecture: one Next.js application embedding Payload CMS, backed by MongoDB, Redis, and S3-compatible storage, with a dedicated worker for PDF generation and a self-hosted CI/CD pipeline.</figcaption>
</figure>

## What This Setup Gets Right

Pulling this apart, a few decisions stand out as worth stealing for a similar project:

- **One repository, one deployable unit, two route groups.** Running the CMS admin panel inside the same Next.js app as the public site — rather than a separate headless CMS service — removes an entire network hop and a second deployment target, at the cost of coupling admin and frontend release cycles together. For a project with one operator, that trade is an easy win.
- **A worker is a deployment target, not a `setTimeout`.** Generating PDFs is the kind of task that's tempting to just do inline in a request handler. Giving it a real job queue and a dedicated container means it scales, restarts, and fails independently of the page that serves visitors.
- **Every observability integration degrades to "off" cleanly.** Sentry, Umami, and the status page all check for their own configuration and simply don't activate without it — which means local development never accidentally talks to production services, and there's no special "dev mode" flag to remember to set.
- **Secrets never touch a Docker layer.** BuildKit secret mounts plus Doppler-synced environments mean neither `docker history` nor a leaked layer cache can leak a credential.

## Frequently Asked Questions

### Why embed Payload CMS instead of using a separate headless CMS?

Running Payload inside the same Next.js process as the public frontend avoids a second network hop on every request and a second service to deploy and monitor. It also lets the admin panel reuse the site's own Tailwind theme and React components directly, so the editing experience visually matches the public site instead of looking like an unrelated backend tool.

### Why generate the resume PDF with a background worker instead of on request?

PDF rendering with `@react-pdf/renderer` is CPU-bound and comparatively slow next to a typical page request. Queuing it as a Payload job and letting a separate worker container process it keeps the web-serving tier fast and stateless, and lets the worker scale or restart independently of the pages visitors are actually browsing.

### Does the site use Payload's built-in localization?

No — `localization` is set to `false` in `payload.config.ts`. Blog posts aren't localized at all. Where bilingual editing genuinely matters (resume content), the site uses a custom `BilingualRichTextField` instead: English and German editors side by side in one document, with Claude-powered auto- and manual-translate buttons rather than Payload's native locale system.

## Conclusion

None of the individual pieces here — Next.js, Payload, MongoDB, Redis, Docker, GitHub Actions — are exotic. What makes this setup worth documenting is how deliberately the boundaries are drawn: a background worker for anything CPU-heavy, observability tools that are silent until configured, secrets that never touch an image layer, and a single Next.js app that carries both the public site and its own CMS without needing a second service to keep alive. For a one-person project, that's the difference between a site that's fun to maintain and one that quietly accumulates operational debt.

*(Related: the full engineering conventions live in `AGENTS.md` at the repository root — code style, known issues, and security guardrails.)*

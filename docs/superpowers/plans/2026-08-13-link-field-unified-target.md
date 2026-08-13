# LinkField Unified Target Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `LinkField`'s type-radio-plus-two-conditional-inputs with a single creatable select, make the label a `{title}` template, and split the icon into leading and trailing slots.

**Architecture:** Storage is unchanged — `reference` stays a real polymorphic Payload relationship (so population keeps working) and `url` stays a text field, now `admin.hidden`. One custom Field component mounted on the `reference` path drives both, writing to whichever sibling matches the selection. The label is stored as a pupa template and resolved on read by a field-level `afterRead` hook on a new `virtual` sibling, `resolvedLabel`.

**Tech Stack:** Payload 3.87, Next.js 16, React 19, MongoDB (mongoose adapter), `@payloadcms/ui`'s `ReactSelect` (wraps `react-select` 5.10), pupa, Vitest 4, Biome.

Spec: `docs/superpowers/specs/2026-08-13-link-field-unified-target-design.md`

## Global Constraints

- Never import `@payloadcms/ui` from a module reachable by `payload.config.ts`. `src/fields/Link/index.ts` is reachable; its `.client.tsx` components referenced by path string are not. A transitive `@payloadcms/ui` import in the config graph breaks `payload generate:types` under plain Node on bundler-only `.css` imports. This is documented at the bottom of `src/fields/Icon/index.ts`.
- Linkable collections are exactly `pages`, `posts`, `topics`, always referenced through the `CollectionSlug` const in `src/types/collections.ts` — never as string literals.
- `LINK_TARGET_OPTION_LIMIT = 200`, shared across all three collections.
- Accepted custom URL grammar: absolute `http:`/`https:`, `mailto:`, `tel:`, root-relative (`/path`), fragment (`#anchor`). Protocol-relative (`//host`) is rejected.
- `{title}` is the only link-specific template variable. It resolves to the referenced document's `title`, or to the hostname of an absolute custom URL, or to the raw URL string when no hostname can be parsed.
- Payload type annotations are mandatory on extracted constants (`Field`, `TextField`, `GroupField`, `FieldHook`, …) — without them `type: 'text'` widens to `string` and the discriminated unions fail to resolve.
- Tests are Vitest, colocated as `*.test.ts` next to the module. Run with `pnpm test <path>`.
- Formatting is Biome; run `pnpm exec biome check --write <paths>` before each commit.
- Per this repo's git config, every commit message ends with the `Co-Authored-By:` and `Claude-Session:` trailers. They are omitted from the command blocks below for brevity — add them.
- `src/types/payload.ts` is generated. Never hand-edit it; regenerate via the dev server or `pnpm run payload generate:types`.

---

### Task 1: Prove the lexical link drawer renders a custom Field component

This is the spec's highest-risk unknown and gates everything after it. `src/fields/RichText/index.ts:113-117` spreads `...LinkField().fields` into lexical's `LinkFeature`, and that drawer does not render through the normal document form. If a custom server component cannot render there, the whole approach needs rethinking — so prove it before building on it.

**Files:**
- Create: `src/fields/Link/components/TargetField.tsx`
- Create: `src/fields/Link/components/TargetField.client.tsx`
- Modify: `src/fields/Link/index.ts:108-123` (the `reference` field)

**Interfaces:**
- Consumes: nothing.
- Produces: the two component files and their `admin.components.Field` wiring, which Task 7 fills in with the real select.

- [ ] **Step 1: Create the skeleton server component**

`src/fields/Link/components/TargetField.tsx`:

```tsx
import type { RelationshipFieldServerComponent, RelationshipFieldServerProps } from 'payload'

import TargetFieldClient from './TargetField.client'

export const TargetField: RelationshipFieldServerComponent = async (
  props: RelationshipFieldServerProps,
) => {
  const { clientField, path } = props

  return <TargetFieldClient field={clientField} path={path} />
}

export default TargetField
```

- [ ] **Step 2: Create the skeleton client component**

`src/fields/Link/components/TargetField.client.tsx`:

```tsx
'use client'

import type { JSX } from 'react'
import type { RelationshipFieldClientProps } from 'payload'
import { useField } from '@payloadcms/ui'

export const TargetFieldClient = ({ path }: RelationshipFieldClientProps): JSX.Element => {
  const { value } = useField<unknown>({
    path,
  })

  return (
    <div className="field-type" data-testid="link-target-field">
      <p>TargetField mounted at path: {path}</p>
      <pre>{JSON.stringify(value ?? null)}</pre>
    </div>
  )
}

export default TargetFieldClient
```

- [ ] **Step 3: Wire it onto the `reference` field**

In `src/fields/Link/index.ts`, add an `admin.components` block to the existing `reference` field. Leave everything else on that field untouched for now:

```ts
{
  name: 'reference',
  type: 'relationship',
  admin: {
    width: '75%',
    condition: (_, siblingData: LinkFieldData) => siblingData?.type === 'reference',
    components: {
      Field: {
        path: '@/fields/Link/components/TargetField',
      },
    },
  },
  label: 'Document to link to',
  maxDepth: 1,
  relationTo: [
    CollectionSlug['Pages'],
    CollectionSlug['BlogPosts'],
    CollectionSlug['BlogTopics'],
  ],
  required: true,
},
```

- [ ] **Step 4: Verify it renders in a normal document form**

Run: `pnpm dev`

In the admin, open any page with a `LinkGroupBlock` (`/admin/collections/pages`), add a link entry, and select "Internal link". Expected: the placeholder box with `TargetField mounted at path: …` appears where the relationship select used to be, and the path reads something like `layout.0.links.entries.0.link.reference`.

- [ ] **Step 5: Verify it renders in the lexical link drawer**

Still in the admin, open a document with a RichText field, select some text, and insert a link. Expected: the same placeholder renders inside the link drawer. **Note the `path` value it prints** — it will be shallower than in the document form, which is exactly why Task 7 derives sibling paths from `path` rather than hardcoding `link.url`.

If the component does **not** render in the drawer, stop here and report back before continuing — the rest of the plan assumes it does.

- [ ] **Step 6: Commit**

```bash
pnpm exec biome check --write src/fields/Link
git add src/fields/Link
git commit -m "feat(link): mount custom Field component on link reference"
```

---

### Task 2: `isValidCustomURL`

**Files:**
- Create: `src/fields/Link/lib/isValidCustomURL.ts`
- Test: `src/fields/Link/lib/isValidCustomURL.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `isValidCustomURL(value: unknown): boolean` — used by Task 7's select and Task 9's `url` validate.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/lib/isValidCustomURL.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { isValidCustomURL } from './isValidCustomURL'

describe('isValidCustomURL', () => {
  it.each([
    'https://example.com',
    'https://example.com/a/b?c=d#e',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+4915112345678',
    '/contact',
    '/',
    '#section',
  ])('accepts %s', (value) => {
    expect(isValidCustomURL(value)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>',
    'ftp://example.com',
    '//evil.example.com',
    'example.com',
    'not a url',
    '',
    '   ',
  ])('rejects %s', (value) => {
    expect(isValidCustomURL(value)).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isValidCustomURL(undefined)).toBe(false)
    expect(isValidCustomURL(null)).toBe(false)
    expect(isValidCustomURL(42)).toBe(false)
  })

  it('ignores surrounding whitespace', () => {
    expect(isValidCustomURL('  https://example.com  ')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/lib/isValidCustomURL.test.ts`
Expected: FAIL — `Failed to resolve import "./isValidCustomURL"`.

- [ ] **Step 3: Write the implementation**

`src/fields/Link/lib/isValidCustomURL.ts`:

```ts
/**
 * Protocols a custom link target may use. Deliberately narrow: anything
 * script-bearing (`javascript:`, `data:`) must never reach an href built from
 * editor input.
 */
const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
]

/**
 * Whether a string is acceptable as a custom link target.
 *
 * Accepts absolute http(s), `mailto:`, `tel:`, root-relative paths and bare
 * fragments. Protocol-relative URLs (`//host`) are rejected — they read as
 * root-relative but resolve off-site.
 */
export const isValidCustomURL = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed.startsWith('//')) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true

  try {
    return ALLOWED_PROTOCOLS.includes(new URL(trimmed).protocol)
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/lib/isValidCustomURL.test.ts`
Expected: PASS, 4 test blocks / 20 assertions.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/lib
git add src/fields/Link/lib
git commit -m "feat(link): add isValidCustomURL guard"
```

---

### Task 3: `resolveLinkTarget`

**Files:**
- Create: `src/fields/Link/lib/resolveLinkTarget.ts`
- Test: `src/fields/Link/lib/resolveLinkTarget.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `LinkTarget` type and `resolveLinkTarget(link): LinkTarget | null` — used by Task 5's title derivation and Task 10's `CMSLink`.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/lib/resolveLinkTarget.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { resolveLinkTarget } from './resolveLinkTarget'

const page = {
  id: 'page-1',
  title: 'About us',
  slug: 'about-us',
}

describe('resolveLinkTarget', () => {
  it('returns the reference branch for a populated reference', () => {
    expect(
      resolveLinkTarget({
        reference: {
          relationTo: 'pages',
          value: page,
        },
      } as never),
    ).toEqual({
      relationTo: 'pages',
      value: page,
    })
  })

  it('returns the reference branch for an unpopulated id', () => {
    expect(
      resolveLinkTarget({
        reference: {
          relationTo: 'posts',
          value: 'post-1',
        },
      } as never),
    ).toEqual({
      relationTo: 'posts',
      value: 'post-1',
    })
  })

  it('returns the customURL branch when only a url is set', () => {
    expect(
      resolveLinkTarget({
        url: 'https://example.com',
      } as never),
    ).toEqual({
      relationTo: 'customURL',
      value: 'https://example.com',
    })
  })

  it('trims the url', () => {
    expect(resolveLinkTarget({ url: '  /contact  ' } as never)).toEqual({
      relationTo: 'customURL',
      value: '/contact',
    })
  })

  it('prefers the reference when both are somehow set', () => {
    expect(
      resolveLinkTarget({
        reference: {
          relationTo: 'pages',
          value: page,
        },
        url: 'https://example.com',
      } as never),
    ).toEqual({
      relationTo: 'pages',
      value: page,
    })
  })

  it('returns null when neither is set', () => {
    expect(resolveLinkTarget({} as never)).toBeNull()
    expect(resolveLinkTarget({ url: '   ' } as never)).toBeNull()
    expect(resolveLinkTarget({ reference: null, url: null } as never)).toBeNull()
    expect(resolveLinkTarget(null)).toBeNull()
    expect(resolveLinkTarget(undefined)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/lib/resolveLinkTarget.test.ts`
Expected: FAIL — `Failed to resolve import "./resolveLinkTarget"`.

- [ ] **Step 3: Write the implementation**

`src/fields/Link/lib/resolveLinkTarget.ts`:

```ts
import type { BlogPostData, LinkFieldData, Page, Topic } from '@/types/payload'

/** The pseudo-slug standing in for "this link points outside the CMS". */
export const CUSTOM_URL_SLUG = 'customURL' as const

export type LinkReferenceCollection = 'pages' | 'posts' | 'topics'
export type LinkReferenceValue = BlogPostData | Page | Topic | string

export type LinkTarget =
  | {
      relationTo: LinkReferenceCollection
      value: LinkReferenceValue
    }
  | {
      relationTo: typeof CUSTOM_URL_SLUG
      value: string
    }

/**
 * Collapses a link's `reference` / `url` pair into the single union the rest
 * of the codebase consumes.
 *
 * The pair is stored rather than the union because `customURL` is not a real
 * collection, and only a real polymorphic relationship gets Payload's
 * automatic population — which both the href and the `{title}` variable
 * depend on. See the design spec for the full reasoning.
 *
 * Returns `null` when neither side is set. Field validation should prevent
 * that, but legacy and partially-written data must not crash a render.
 */
export const resolveLinkTarget = (
  link?: Partial<LinkFieldData> | null,
): LinkTarget | null => {
  if (!link) return null

  const { reference, url } = link

  if (reference?.relationTo && reference.value) {
    return {
      relationTo: reference.relationTo,
      value: reference.value,
    }
  }

  if (typeof url === 'string' && url.trim()) {
    return {
      relationTo: CUSTOM_URL_SLUG,
      value: url.trim(),
    }
  }

  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/lib/resolveLinkTarget.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/lib
git add src/fields/Link/lib
git commit -m "feat(link): add resolveLinkTarget union helper"
```

---

### Task 4: `deriveLinkTitle`

**Files:**
- Create: `src/fields/Link/lib/deriveLinkTitle.ts`
- Test: `src/fields/Link/lib/deriveLinkTitle.test.ts`

**Interfaces:**
- Consumes: `LinkTarget`, `CUSTOM_URL_SLUG` from Task 3.
- Produces: `deriveLinkTitle(target: LinkTarget | null): string` — the `{title}` value, used by Task 6's hook and Task 8's label component.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/lib/deriveLinkTitle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { deriveLinkTitle } from './deriveLinkTitle'

describe('deriveLinkTitle', () => {
  it('uses the title of a populated reference', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'pages',
        value: {
          id: 'page-1',
          title: 'About us',
          slug: 'about-us',
        } as never,
      }),
    ).toBe('About us')
  })

  it('returns an empty string for an unpopulated reference', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'pages',
        value: 'page-1',
      }),
    ).toBe('')
  })

  it('uses the hostname of an absolute custom URL', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: 'https://github.com/danielheene/website',
      }),
    ).toBe('github.com')
  })

  it('falls back to the raw string when there is no hostname', () => {
    expect(deriveLinkTitle({ relationTo: 'customURL', value: '/contact' })).toBe('/contact')
    expect(deriveLinkTitle({ relationTo: 'customURL', value: '#top' })).toBe('#top')
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: 'mailto:hello@example.com',
      }),
    ).toBe('mailto:hello@example.com')
  })

  it('returns an empty string for no target', () => {
    expect(deriveLinkTitle(null)).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/lib/deriveLinkTitle.test.ts`
Expected: FAIL — `Failed to resolve import "./deriveLinkTitle"`.

- [ ] **Step 3: Write the implementation**

`src/fields/Link/lib/deriveLinkTitle.ts`:

```ts
import { CUSTOM_URL_SLUG, type LinkTarget } from './resolveLinkTarget'

/**
 * Hostname of an absolute URL, or the input unchanged when it has none —
 * `mailto:`, `tel:`, root-relative paths and fragments all parse without a
 * host, and showing the raw string beats showing nothing.
 */
const hostnameOrRaw = (url: string): string => {
  try {
    return new URL(url).hostname || url
  } catch {
    return url
  }
}

/**
 * The value bound to `{title}` when rendering a link label.
 *
 * A reference contributes its document title; a custom URL contributes its
 * hostname. The fallback matters: `label` defaults to `{title}`, so an empty
 * result would silently produce an unlabelled link.
 */
export const deriveLinkTitle = (target: LinkTarget | null): string => {
  if (!target) return ''

  if (target.relationTo === CUSTOM_URL_SLUG) {
    return hostnameOrRaw(target.value)
  }

  const { value } = target

  if (value && typeof value === 'object' && 'title' in value) {
    return typeof value.title === 'string' ? value.title : ''
  }

  return ''
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/lib/deriveLinkTitle.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/lib
git add src/fields/Link/lib
git commit -m "feat(link): add deriveLinkTitle for the {title} variable"
```

---

### Task 5: Extract `renderTemplate`'s core into a plain module

`src/lib/renderTemplate.ts` is `'use server'`, so every export is a server action — not something a Payload field hook should depend on. Move the logic to a plain module and leave the action as a wrapper, so the three existing importers (`src/jobs-queue/workflows/generateResumeDocument.tsx`, `src/jobs-queue/tasks/generateLocalizedResumeDocument.tsx`, `src/fields/Template/Components/FieldComponent.client.tsx`) keep working untouched.

**Files:**
- Create: `src/lib/renderTemplate.core.ts`
- Modify: `src/lib/renderTemplate.ts` (reduce to a wrapper)
- Test: `src/lib/renderTemplate.core.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `renderTemplateCore(args: RenderTemplateCoreArgs): Promise<RenderTemplateResult | RenderTemplateError>` where `RenderTemplateCoreArgs = RenderTemplateArgs & { req?: PayloadRequest }`. Used by Task 6's hook.

- [ ] **Step 1: Write the failing test**

`src/lib/renderTemplate.core.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchSiteSettings = vi.fn()
const fetchGlobalUserSettings = vi.fn()

vi.mock('@/lib/fetchers', () => ({
  fetchSiteSettings: (locale: string) => fetchSiteSettings(locale),
  fetchGlobalUserSettings: (locale: string) => fetchGlobalUserSettings(locale),
}))

const payloadStub = {
  config: {
    serverURL: 'http://localhost:3000',
  },
  getAPIURL: () => 'http://localhost:3000/api',
  getAdminURL: () => 'http://localhost:3000/admin',
}

import { renderTemplateCore } from './renderTemplate.core'

beforeEach(() => {
  fetchSiteSettings.mockResolvedValue({
    general: {
      siteName: 'Daniel Heene',
      siteURL: 'http://localhost:3000',
      siteHost: 'localhost',
    },
  })
  fetchGlobalUserSettings.mockResolvedValue({
    firstName: 'Daniel',
    lastName: 'Heene',
    name: 'Daniel Heene',
  })
})

const req = () =>
  ({
    context: {},
    payload: payloadStub,
  }) as never

describe('renderTemplateCore', () => {
  it('renders a caller-supplied variable', async () => {
    const { result, error } = await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'About us',
      },
      req: req(),
    })

    expect(error).toBeNull()
    expect(result).toBe('About us')
  })

  it('renders global variables alongside caller data', async () => {
    const { result } = await renderTemplateCore({
      template: '{title} — {siteName}',
      data: {
        title: 'About us',
      },
      req: req(),
    })

    expect(result).toBe('About us — Daniel Heene')
  })

  it('applies filters', async () => {
    const { result } = await renderTemplateCore({
      template: '{title | kebabCase}',
      data: {
        title: 'About Us',
      },
      req: req(),
    })

    expect(result).toBe('about-us')
  })

  it('returns an error for an unresolvable variable', async () => {
    const { result, error } = await renderTemplateCore({
      template: '{nope}',
      data: {},
      req: req(),
    })

    expect(result).toBeNull()
    expect(error).toEqual(expect.any(String))
  })

  it('fetches globals once per request when a req is supplied', async () => {
    const sharedReq = req()

    await renderTemplateCore({ template: '{title}', data: { title: 'a' }, req: sharedReq })
    await renderTemplateCore({ template: '{title}', data: { title: 'b' }, req: sharedReq })
    await renderTemplateCore({ template: '{title}', data: { title: 'c' }, req: sharedReq })

    expect(fetchSiteSettings).toHaveBeenCalledTimes(1)
    expect(fetchGlobalUserSettings).toHaveBeenCalledTimes(1)
  })

  it('keys the per-request cache by locale', async () => {
    const sharedReq = req()

    await renderTemplateCore({ template: '{title}', data: { title: 'a' }, req: sharedReq })
    await renderTemplateCore({
      template: '{title}',
      data: { title: 'a' },
      locale: 'de',
      req: sharedReq,
    })

    expect(fetchSiteSettings).toHaveBeenCalledTimes(2)
    expect(fetchSiteSettings).toHaveBeenNthCalledWith(1, 'en')
    expect(fetchSiteSettings).toHaveBeenNthCalledWith(2, 'de')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/renderTemplate.core.test.ts`
Expected: FAIL — `Failed to resolve import "./renderTemplate.core"`.

- [ ] **Step 3: Create the core module**

This step is a **move**, not a rewrite. Copy `src/lib/renderTemplate.ts` to `src/lib/renderTemplate.core.ts` verbatim — all 169 lines, imports included — then apply exactly these four changes and nothing else. Do not retype the pupa call, the data proxy or the filter proxy; every filter and every `nanoid`/`len`/`trunc` special case must survive byte-identical.

1. Drop the `'use server'` directive.
2. Move the type declarations (`RenderTemplateArgs`, `RenderTemplateResult`, `RenderTemplateError`) here and add `RenderTemplateCoreArgs`.
3. Replace the unconditional `getPayload({ config })` with `req?.payload ?? (await getPayload({ config }))`.
4. Replace the two sequential global fetches with the memoised `loadTemplateGlobals` below.

The new header and globals loader:

```ts
import config from '@payload-config'
import { getPayload, type PayloadRequest } from 'payload'

// ...all existing imports from renderTemplate.ts carry over unchanged...

export type RenderTemplateArgs = {
  template: string
  data?: Record<string, string>
  locale?: Locale
}

export type RenderTemplateResult = {
  result: string
  error: null
}

export type RenderTemplateError = {
  error: string
  result: null
}

export type RenderTemplateCoreArgs = RenderTemplateArgs & {
  /**
   * When supplied, the request's own payload instance is reused and the
   * global settings are memoised on `req.context` for its lifetime. A page
   * rendering N links would otherwise cost 2N global reads.
   */
  req?: PayloadRequest
}

type TemplateGlobals = {
  site: Awaited<ReturnType<typeof fetchSiteSettings>>
  user: Awaited<ReturnType<typeof fetchGlobalUserSettings>>
}

const GLOBALS_CONTEXT_KEY = 'renderTemplateGlobals'

const loadTemplateGlobals = async (
  locale: Locale,
  req?: PayloadRequest,
): Promise<TemplateGlobals> => {
  const cacheKey = `${GLOBALS_CONTEXT_KEY}:${locale}`
  const cached = req?.context?.[cacheKey] as TemplateGlobals | undefined

  if (cached) return cached

  const [
    site,
    user,
  ] = await Promise.all([
    fetchSiteSettings(locale),
    fetchGlobalUserSettings(locale),
  ])

  const globals: TemplateGlobals = {
    site,
    user,
  }

  if (req?.context) req.context[cacheKey] = globals

  return globals
}
```

And the function signature plus its first lines:

```ts
export const renderTemplateCore = async ({
  template,
  data = {},
  locale = 'en',
  req,
}: RenderTemplateCoreArgs): Promise<RenderTemplateError | RenderTemplateResult> => {
  const payload = req?.payload ?? (await getPayload({ config }))

  const {
    getAPIURL,
    getAdminURL,
    config: { serverURL },
  } = payload

  const {
    site: {
      general: { siteName, siteURL, siteHost },
    },
    user: { firstName, lastName, name, jobTitle, birthDate, email, gender, pronouns },
  } = await loadTemplateGlobals(locale, req)

  // ...the existing try/catch with the pupa call, data proxy and filter
  // proxy carries over verbatim from renderTemplate.ts...
}
```

- [ ] **Step 4: Reduce `renderTemplate.ts` to a wrapper**

Replace the whole of `src/lib/renderTemplate.ts` with:

```ts
'use server'

import {
  renderTemplateCore,
  type RenderTemplateArgs,
  type RenderTemplateError,
  type RenderTemplateResult,
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
```

- [ ] **Step 5: Run the new test and the full suite**

Run: `pnpm test src/lib/renderTemplate.core.test.ts`
Expected: PASS, 6 tests.

Run: `pnpm test`
Expected: the whole suite passes — this confirms the three existing `renderTemplate` importers still resolve.

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
pnpm exec biome check --write src/lib/renderTemplate.ts src/lib/renderTemplate.core.ts src/lib/renderTemplate.core.test.ts
git add src/lib/renderTemplate.ts src/lib/renderTemplate.core.ts src/lib/renderTemplate.core.test.ts
git commit -m "refactor(template): extract renderTemplate core with per-request globals cache"
```

---

### Task 6: `renderLinkLabel` afterRead hook

**Files:**
- Create: `src/fields/Link/hooks/renderLinkLabel.ts`
- Test: `src/fields/Link/hooks/renderLinkLabel.test.ts`

**Interfaces:**
- Consumes: `resolveLinkTarget` (Task 3), `deriveLinkTitle` (Task 4), `renderTemplateCore` (Task 5).
- Produces: `renderLinkLabel: FieldHook<TypeWithID, string>` — mounted on `resolvedLabel` in Task 9.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/hooks/renderLinkLabel.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderTemplateCore = vi.fn()

vi.mock('@/lib/renderTemplate.core', () => ({
  renderTemplateCore: (args: unknown) => renderTemplateCore(args),
}))

import { renderLinkLabel } from './renderLinkLabel'

const req = () =>
  ({
    context: {},
    payload: {
      logger: {
        error: vi.fn(),
      },
    },
  }) as never

const call = (siblingData: unknown) =>
  renderLinkLabel({
    siblingData,
    req: req(),
  } as never)

beforeEach(() => {
  renderTemplateCore.mockImplementation(async ({ template, data }) => ({
    result: template.replace('{title}', String(data?.title ?? '')),
    error: null,
  }))
})

describe('renderLinkLabel', () => {
  it('renders {title} from a populated reference', async () => {
    await expect(
      call({
        label: '{title}',
        reference: {
          relationTo: 'pages',
          value: {
            id: 'page-1',
            title: 'About us',
            slug: 'about-us',
          },
        },
      }),
    ).resolves.toBe('About us')
  })

  it('renders {title} as the hostname of a custom URL', async () => {
    await expect(
      call({
        label: '{title}',
        url: 'https://github.com/danielheene/website',
      }),
    ).resolves.toBe('github.com')
  })

  it('passes a literal label through untouched', async () => {
    await expect(
      call({
        label: 'Read the docs',
        url: 'https://example.com',
      }),
    ).resolves.toBe('Read the docs')
  })

  it('returns an empty string when there is no label', async () => {
    await expect(call({ url: 'https://example.com' })).resolves.toBe('')
    expect(renderTemplateCore).not.toHaveBeenCalled()
  })

  it('forwards req so the globals cache is shared', async () => {
    await call({
      label: '{title}',
      url: 'https://example.com',
    })

    expect(renderTemplateCore).toHaveBeenCalledWith(
      expect.objectContaining({
        req: expect.objectContaining({
          context: expect.any(Object),
        }),
      }),
    )
  })

  it('falls back to the raw template when rendering fails', async () => {
    renderTemplateCore.mockResolvedValue({
      result: null,
      error: 'Missing a value for the placeholder: nope',
    })

    await expect(
      call({
        label: '{nope}',
        url: 'https://example.com',
      }),
    ).resolves.toBe('{nope}')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/hooks/renderLinkLabel.test.ts`
Expected: FAIL — `Failed to resolve import "./renderLinkLabel"`.

- [ ] **Step 3: Write the implementation**

`src/fields/Link/hooks/renderLinkLabel.ts`:

```ts
import type { FieldHook, TypeWithID } from 'payload'

import { deriveLinkTitle } from '@/fields/Link/lib/deriveLinkTitle'
import { resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { renderTemplateCore } from '@/lib/renderTemplate.core'
import type { LinkFieldData } from '@/types/payload'

/**
 * Renders the stored `label` template into the virtual `resolvedLabel`.
 *
 * Runs on every read rather than at save time on purpose: that is what keeps
 * `{title}` in step with the target document's actual title after a rename.
 *
 * A render failure degrades to the raw template rather than to an empty
 * label — a visible `{title}` is a far better signal than a link that
 * silently loses its text.
 */
export const renderLinkLabel: FieldHook<TypeWithID, string> = async ({ req, siblingData }) => {
  const link = siblingData as Partial<LinkFieldData> | undefined
  const template = typeof link?.label === 'string' ? link.label : ''

  if (!template) return ''

  const title = deriveLinkTitle(resolveLinkTarget(link))

  const { result, error } = await renderTemplateCore({
    template,
    data: {
      title,
    },
    req,
  })

  if (error !== null) {
    req?.payload?.logger?.error(
      {
        err: error,
        template,
      },
      'Failed to render link label template',
    )

    return template
  }

  return result
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/hooks/renderLinkLabel.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/hooks
git add src/fields/Link/hooks
git commit -m "feat(link): add renderLinkLabel afterRead hook"
```

---

### Task 7: `fetchLinkTargetOptions`

**Files:**
- Create: `src/fields/Link/lib/fetchLinkTargetOptions.ts`
- Test: `src/fields/Link/lib/fetchLinkTargetOptions.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `LINK_TARGET_OPTION_LIMIT`, `LINK_TARGET_COLLECTIONS`, `LinkTargetOption`, `LinkTargetOptionGroup`, `linkTargetOptionValue(relationTo, id)`, and `fetchLinkTargetOptions(req)`. Used by Tasks 8 and 9.

Note the composite option value: `react-select` requires values unique across **all** groups, and a page and a post can share an id shape, so options are keyed `${relationTo}:${id}`. The raw id is kept alongside as `docID` — not `id`, which Payload's `ReactSelect` uses for its own sortable/draggable bookkeeping.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/lib/fetchLinkTargetOptions.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

import {
  fetchLinkTargetOptions,
  LINK_TARGET_OPTION_LIMIT,
  linkTargetOptionValue,
} from './fetchLinkTargetOptions'

const makeReq = (docsByCollection: Record<string, { id: string; title: string }[]>) => {
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs: docsByCollection[collection] ?? [],
  }))

  return {
    find,
    req: {
      payload: {
        find,
      },
      user: {
        id: 'user-1',
      },
    } as never,
  }
}

describe('linkTargetOptionValue', () => {
  it('namespaces the id by collection', () => {
    expect(linkTargetOptionValue('pages', 'abc')).toBe('pages:abc')
  })
})

describe('fetchLinkTargetOptions', () => {
  it('returns one group per collection, in configured order', async () => {
    const { req } = makeReq({
      pages: [
        {
          id: 'p1',
          title: 'About us',
        },
      ],
      posts: [
        {
          id: 'b1',
          title: 'Hello world',
        },
      ],
      topics: [],
    })

    const groups = await fetchLinkTargetOptions(req)

    expect(groups.map((group) => group.label)).toEqual([
      'Pages',
      'Blog Posts',
      'Topics',
    ])
    expect(groups[0].options).toEqual([
      {
        label: 'About us',
        value: 'pages:p1',
        relationTo: 'pages',
        docID: 'p1',
      },
    ])
    expect(groups[2].options).toEqual([])
  })

  it('queries each collection with access control enforced', async () => {
    const { find, req } = makeReq({})

    await fetchLinkTargetOptions(req)

    expect(find).toHaveBeenCalledTimes(3)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        depth: 0,
        limit: LINK_TARGET_OPTION_LIMIT,
        overrideAccess: false,
        sort: 'title',
        req,
        user: req.user,
      }),
    )
  })

  it('falls back to the id when a document has no title', async () => {
    const { req } = makeReq({
      pages: [
        {
          id: 'p1',
        } as never,
      ],
    })

    const groups = await fetchLinkTargetOptions(req)

    expect(groups[0].options[0].label).toBe('p1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/lib/fetchLinkTargetOptions.test.ts`
Expected: FAIL — `Failed to resolve import "./fetchLinkTargetOptions"`.

- [ ] **Step 3: Write the implementation**

`src/fields/Link/lib/fetchLinkTargetOptions.ts`:

```ts
import { cache } from 'react'
import type { PayloadRequest } from 'payload'

import { CollectionSlug } from '@/types/collections'

/**
 * Ceiling on documents offered per collection. Options are preloaded rather
 * than searched, so this bounds the query — the failure mode is "entries
 * missing from the list", never an unbounded read. Swapping in a debounced
 * search endpoint later is contained to this module and the select's client
 * half.
 */
export const LINK_TARGET_OPTION_LIMIT = 200

export const LINK_TARGET_COLLECTIONS = [
  {
    slug: CollectionSlug.Pages,
    label: 'Pages',
  },
  {
    slug: CollectionSlug.BlogPosts,
    label: 'Blog Posts',
  },
  {
    slug: CollectionSlug.BlogTopics,
    label: 'Topics',
  },
] as const

export type LinkTargetOption = {
  label: string
  /** `${relationTo}:${id}` — react-select needs values unique across groups. */
  value: string
  relationTo: string
  /**
   * The bare document id. Named `docID` rather than `id` because Payload's
   * `ReactSelect` reserves `id` on options for its own bookkeeping.
   */
  docID: string
}

export type LinkTargetOptionGroup = {
  label: string
  options: LinkTargetOption[]
}

export const linkTargetOptionValue = (relationTo: string, id: string): string =>
  `${relationTo}:${id}`

/**
 * Every document an editor may link to, grouped by collection.
 *
 * Memoised on `req` so the two field server components that need it — the
 * target select and the label — share one set of queries per request.
 */
export const fetchLinkTargetOptions = cache(
  async (req: PayloadRequest): Promise<LinkTargetOptionGroup[]> =>
    Promise.all(
      LINK_TARGET_COLLECTIONS.map(async ({ slug, label }) => {
        const { docs } = await req.payload.find({
          collection: slug,
          depth: 0,
          limit: LINK_TARGET_OPTION_LIMIT,
          overrideAccess: false,
          req,
          select: {
            title: true,
            slug: true,
          },
          sort: 'title',
          user: req.user,
        })

        return {
          label,
          options: docs.map((doc) => {
            const id = String(doc.id)

            return {
              label: typeof doc.title === 'string' && doc.title ? doc.title : id,
              value: linkTargetOptionValue(slug, id),
              relationTo: slug,
              docID: id,
            }
          }),
        }
      }),
    ),
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/lib/fetchLinkTargetOptions.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/lib
git add src/fields/Link/lib
git commit -m "feat(link): add cached link target option loader"
```

---

### Task 8: The creatable target select

Replaces Task 1's placeholder with the real control.

**Files:**
- Modify: `src/fields/Link/components/TargetField.tsx` (full rewrite)
- Modify: `src/fields/Link/components/TargetField.client.tsx` (full rewrite)

**Interfaces:**
- Consumes: `fetchLinkTargetOptions`, `linkTargetOptionValue`, `LinkTargetOptionGroup` (Task 7); `isValidCustomURL` (Task 2).
- Produces: a select that writes `{ relationTo, value: id }` to the `reference` path and a string to the sibling `url` path.

- [ ] **Step 1: Rewrite the server component**

`src/fields/Link/components/TargetField.tsx`:

```tsx
import type { RelationshipFieldServerComponent, RelationshipFieldServerProps } from 'payload'

import { fetchLinkTargetOptions } from '@/fields/Link/lib/fetchLinkTargetOptions'

import TargetFieldClient from './TargetField.client'

export const TargetField: RelationshipFieldServerComponent = async (
  props: RelationshipFieldServerProps,
) => {
  const { clientField, path, readOnly, req } = props

  const optionGroups = await fetchLinkTargetOptions(req)

  return (
    <TargetFieldClient
      field={clientField}
      optionGroups={optionGroups}
      path={path}
      readOnly={readOnly}
    />
  )
}

export default TargetField
```

- [ ] **Step 2: Rewrite the client component**

`src/fields/Link/components/TargetField.client.tsx`:

```tsx
'use client'

import { type JSX, useCallback, useMemo, useState } from 'react'
import type { RelationshipFieldClientProps } from 'payload'
import { FieldError, FieldLabel, fieldBaseClass, ReactSelect, useField } from '@payloadcms/ui'

import {
  linkTargetOptionValue,
  type LinkTargetOption,
  type LinkTargetOptionGroup,
} from '@/fields/Link/lib/fetchLinkTargetOptions'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { CUSTOM_URL_SLUG } from '@/fields/Link/lib/resolveLinkTarget'
import { cn } from '@/lib/cn'

type ReferenceValue = {
  relationTo: string
  value: { id?: string; title?: string } | string
} | null

type TargetFieldClientProps = RelationshipFieldClientProps & {
  optionGroups: LinkTargetOptionGroup[]
}

const CREATE_ERROR =
  'Enter an absolute http(s) URL, a mailto:/tel: link, a path starting with “/”, or a “#” anchor.'

/**
 * Sibling path for the same link group. Derived from this field's own path
 * rather than hardcoded, because the link fields are also spread into
 * lexical's `LinkFeature`, where they sit at a shallower depth.
 */
const siblingPath = (path: string, name: string): string => path.replace(/[^.]+$/, name)

export const TargetFieldClient = ({
  field,
  optionGroups,
  path,
  readOnly,
}: TargetFieldClientProps): JSX.Element => {
  const [createError, setCreateError] = useState<null | string>(null)

  const {
    value: reference,
    setValue: setReference,
    showError,
    errorMessage,
  } = useField<ReferenceValue>({
    path,
  })

  const { value: url, setValue: setUrl } = useField<null | string>({
    path: siblingPath(path, 'url'),
  })

  const flatOptions = useMemo(
    () => optionGroups.flatMap((group) => group.options),
    [
      optionGroups,
    ],
  )

  /**
   * The option currently shown in the control. A stored reference that is
   * not in the preloaded list — deleted, or past LINK_TARGET_OPTION_LIMIT —
   * is synthesised from its populated value so the field reads as filled
   * rather than empty.
   */
  const selected = useMemo<LinkTargetOption | null>(() => {
    if (reference?.relationTo && reference.value) {
      const id =
        typeof reference.value === 'object' ? String(reference.value.id) : String(reference.value)
      const value = linkTargetOptionValue(reference.relationTo, id)
      const known = flatOptions.find((option) => option.value === value)

      if (known) return known

      const title = typeof reference.value === 'object' ? reference.value.title : undefined

      return {
        label: title || id,
        value,
        relationTo: reference.relationTo,
        docID: id,
      }
    }

    if (url) {
      return {
        label: url,
        value: linkTargetOptionValue(CUSTOM_URL_SLUG, url),
        relationTo: CUSTOM_URL_SLUG,
        docID: url,
      }
    }

    return null
  }, [
    flatOptions,
    reference,
    url,
  ])

  const handleChange = useCallback(
    (option: unknown) => {
      const next = option as (LinkTargetOption & { __isNew__?: boolean }) | null

      if (!next) {
        setReference(null)
        setUrl(null)
        setCreateError(null)
        return
      }

      // A created option carries react-select's default shape, where both
      // `label` and `value` are the raw typed string.
      if (next.__isNew__ || next.relationTo === CUSTOM_URL_SLUG) {
        const candidate = String(next.__isNew__ ? next.value : next.docID).trim()

        if (!isValidCustomURL(candidate)) {
          setCreateError(CREATE_ERROR)
          return
        }

        setReference(null)
        setUrl(candidate)
        setCreateError(null)
        return
      }

      setUrl(null)
      setReference({
        relationTo: next.relationTo,
        value: next.docID,
      })
      setCreateError(null)
    },
    [
      setReference,
      setUrl,
    ],
  )

  const hasError = showError || createError !== null

  return (
    <div className={cn(fieldBaseClass, 'relationship', hasError && 'error')}>
      <FieldLabel label={field?.label} path={path} required />

      <ReactSelect
        isClearable
        isCreatable
        disabled={readOnly}
        inputId={`field-${path.replace(/\./g, '__')}`}
        onChange={handleChange}
        options={optionGroups}
        placeholder="Select a document, or type a URL to link somewhere else"
        showError={hasError}
        value={selected ?? undefined}
      />

      <FieldError
        message={createError ?? errorMessage}
        path={path}
        showError={hasError}
      />
    </div>
  )
}

export default TargetFieldClient
```

- [ ] **Step 3: Verify the four interactions by hand**

Run: `pnpm dev`

Open a page with a `LinkGroupBlock` and check each of these, confirming with the browser devtools Network tab that the saved document matches:

1. **Pick a document** → the select shows its title under the right collection group; saving stores `reference: { relationTo, value }` and `url: null`.
2. **Type `https://example.com` and create it** → the select shows the URL; saving stores `url` and `reference: null`.
3. **Type `example.com` and try to create it** → the inline error appears and nothing is written.
4. **Clear the select** → both fields go null and the field shows its required error on save.

- [ ] **Step 4: Verify it still works in the lexical link drawer**

Insert a link in a RichText field and repeat interactions 1 and 2 in the drawer. This is the path Task 1 proved renders; confirm the sibling-path derivation also resolves correctly there by checking that a created URL survives a save and reopen.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Link/components
git add src/fields/Link/components
git commit -m "feat(link): add creatable document/URL target select"
```

---

### Task 9: Template label field

**Files:**
- Modify: `src/fields/Template/index.ts` (add `overrides`)
- Create: `src/fields/Link/components/LabelField.tsx`
- Create: `src/fields/Link/components/LabelField.client.tsx`

**Interfaces:**
- Consumes: `fetchLinkTargetOptions`, `linkTargetOptionValue` (Task 7); `deriveLinkTitle` (Task 4); the existing `FieldComponentClient` from `src/fields/Template/Components/FieldComponent.client.tsx`.
- Produces: `TemplateField({ ..., overrides })` and the label components wired in Task 10.

- [ ] **Step 1: Add `overrides` to `TemplateField`**

In `src/fields/Template/index.ts`, add the param and merge, matching the `deepMerge`-plus-`overrides` convention used by `IconField` and `LinkField`:

```ts
import { deepMerge, TextField } from 'payload'

type TemplateFieldOverrides = Partial<Omit<TextField, 'name' | 'type'>>

type TemplateFieldProps = {
  name: string
  label?: string | false
  description?: string
  defaultValue?: string
  renderLocale?: Locale[]

  data?: TemplateFieldData | TemplateFieldDataFunction
  anntotation?: TemplateFieldAnnotation | TemplateFieldAnnotationFunction
  /**
   * Escape hatch for call sites that need a different client component —
   * the link label, for instance, sources `{title}` from live form state
   * rather than from server props.
   */
  overrides?: TemplateFieldOverrides
}

export const TemplateField = ({
  name,
  label = false,
  description,
  defaultValue,
  data,
  anntotation,
  overrides = {},
  renderLocale = [
    'en',
  ],
}: TemplateFieldProps): TextField =>
  deepMerge<TextField, TemplateFieldOverrides>(
    {
      // ...the existing returned object, unchanged...
    },
    overrides,
  )
```

- [ ] **Step 2: Create the label server component**

`src/fields/Link/components/LabelField.tsx`:

```tsx
import type { TextFieldServerComponent, TextFieldServerProps } from 'payload'

import { fetchLinkTargetOptions } from '@/fields/Link/lib/fetchLinkTargetOptions'

import LabelFieldClient from './LabelField.client'

export const LabelField: TextFieldServerComponent = async (props: TextFieldServerProps) => {
  const { clientField, path, req } = props

  const optionGroups = await fetchLinkTargetOptions(req)

  return <LabelFieldClient field={clientField} optionGroups={optionGroups} path={path} />
}

export default LabelField
```

- [ ] **Step 3: Create the label client component**

It reuses `FieldComponentClient` wholesale, changing only where `data` comes from — server props become live form state, so the preview updates the moment a different document is selected.

`src/fields/Link/components/LabelField.client.tsx`:

```tsx
'use client'

import { type JSX, useMemo } from 'react'
import type { TextFieldClientProps } from 'payload'
import { useFormFields } from '@payloadcms/ui'

import FieldComponentClient from '@/fields/Template/Components/FieldComponent.client'
import { deriveLinkTitle } from '@/fields/Link/lib/deriveLinkTitle'
import type { LinkTargetOptionGroup } from '@/fields/Link/lib/fetchLinkTargetOptions'
import { linkTargetOptionValue } from '@/fields/Link/lib/fetchLinkTargetOptions'
import { resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'

type LabelFieldClientProps = TextFieldClientProps & {
  optionGroups: LinkTargetOptionGroup[]
}

const siblingPath = (path: string, name: string): string => path.replace(/[^.]+$/, name)

export const LabelFieldClient = ({
  optionGroups,
  path,
  ...rest
}: LabelFieldClientProps): JSX.Element => {
  const referencePath = siblingPath(path, 'reference')
  const urlPath = siblingPath(path, 'url')

  const reference = useFormFields(([fields]) => fields[referencePath]?.value)
  const url = useFormFields(([fields]) => fields[urlPath]?.value)

  /**
   * Form state holds an unpopulated reference, so the title comes from the
   * preloaded option list rather than from the value itself. Falls through
   * to `deriveLinkTitle` for the custom-URL branch.
   */
  const title = useMemo(() => {
    const typed = reference as { relationTo?: string; value?: string } | null | undefined

    if (typed?.relationTo && typed.value) {
      const value = linkTargetOptionValue(typed.relationTo, String(typed.value))
      const option = optionGroups.flatMap((group) => group.options).find((o) => o.value === value)

      if (option) return option.label
    }

    return deriveLinkTitle(
      resolveLinkTarget({
        url: typeof url === 'string' ? url : null,
      } as never),
    )
  }, [
    optionGroups,
    reference,
    url,
  ])

  return (
    <FieldComponentClient
      {...rest}
      path={path}
      data={{
        title,
      }}
      annotations={[
        {
          label: 'Link Data',
          entries: {
            '{title}':
              'Title of the linked document, or the hostname of a custom URL',
          },
        },
      ]}
    />
  )
}

export default LabelFieldClient
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/fields/Template/index.ts src/fields/Link/components
git add src/fields/Template/index.ts src/fields/Link/components
git commit -m "feat(link): add template-backed label field with live {title}"
```

---

### Task 10: Rewire the `LinkField` config

The task that actually changes the editing experience, and where risks 2 and 3 from the spec get settled.

**Files:**
- Modify: `src/fields/Link/index.ts` (full rewrite of the `fields` array)
- Test: `src/fields/Link/index.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2, 6, 8 and 9.
- Produces: the new field shape — `reference`, `url` (hidden), `label`, `resolvedLabel` (virtual), `iconBefore`, `iconAfter`, `iconOnly`, `newTab`, optional `appearance`. No `type`, no `icon`.

- [ ] **Step 1: Write the failing test**

`src/fields/Link/index.test.ts`:

```ts
import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { LinkField } from './index'

const flatten = (fields: Field[]): Field[] =>
  fields.flatMap((field) =>
    'fields' in field && Array.isArray(field.fields) ? flatten(field.fields as Field[]) : [field],
  )

const named = (name: string) =>
  flatten(LinkField().fields).find((field) => 'name' in field && field.name === name)

describe('LinkField', () => {
  it('no longer exposes the type radio or the single icon', () => {
    expect(named('type')).toBeUndefined()
    expect(named('icon')).toBeUndefined()
  })

  it('exposes both icon slots', () => {
    expect(named('iconBefore')).toBeDefined()
    expect(named('iconAfter')).toBeDefined()
  })

  it('defaults the label to the title template', () => {
    expect(named('label')).toMatchObject({
      defaultValue: '{title}',
    })
  })

  it('exposes resolvedLabel as a virtual field', () => {
    expect(named('resolvedLabel')).toMatchObject({
      virtual: true,
      type: 'text',
    })
  })

  it('hides the url field but keeps it in the schema', () => {
    const url = named('url')

    expect(url).toBeDefined()
    expect(url).toMatchObject({
      admin: {
        hidden: true,
      },
    })
  })

  it('requires exactly one of reference or url', () => {
    const reference = named('reference')
    const validate = (reference as { validate: Function }).validate

    expect(validate(null, { siblingData: {} })).toEqual(expect.any(String))
    expect(validate(null, { siblingData: { url: 'https://example.com' } })).toBe(true)
    expect(validate({ relationTo: 'pages', value: 'p1' }, { siblingData: {} })).toBe(true)
  })

  it('omits the appearance select unless asked for it', () => {
    const withAppearance = flatten(
      LinkField({ withAppearanceSelect: true }).fields,
    ).find((field) => 'name' in field && field.name === 'appearance')

    expect(named('appearance')).toBeUndefined()
    expect(withAppearance).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/fields/Link/index.test.ts`
Expected: FAIL — `type` and `icon` are still defined, `resolvedLabel` is undefined.

- [ ] **Step 3: Rewrite the fields array**

Replace the `fields` array in `src/fields/Link/index.ts` with the following. `appearanceOptions`, the `LinkFieldOverrides` / `LinkFieldConfig` types, the `deepMerge` wrapper and the group's own `name`/`type`/`label`/`interfaceName`/`admin` all stay exactly as they are.

```ts
fields: [
  {
    type: 'row',
    admin: {
      className: 'link-field__options',
    },
    fields: [
      {
        name: 'reference',
        type: 'relationship',
        admin: {
          width: '75%',
          components: {
            Field: {
              path: '@/fields/Link/components/TargetField',
            },
          },
        },
        label: 'Links to',
        maxDepth: 1,
        relationTo: [
          CollectionSlug['Pages'],
          CollectionSlug['BlogPosts'],
          CollectionSlug['BlogTopics'],
        ],
        validate: (value: unknown, { siblingData }: { siblingData: LinkFieldData }) =>
          value || siblingData?.url
            ? true
            : 'Select a document, or enter a custom URL.',
      },
      {
        name: 'newTab',
        type: 'checkbox',
        admin: {
          className: 'link-field__new-tab-option',
          width: '25%',
        },
        label: 'Open in new tab',
      },
    ],
  },
  {
    // Written by the target select above, never rendered on its own. Still a
    // real, validated field so that imports, seeds and API writes are checked.
    name: 'url',
    type: 'text',
    admin: {
      hidden: true,
    },
    label: 'Custom URL',
    validate: (value: unknown) =>
      !value || isValidCustomURL(value)
        ? true
        : 'Enter an absolute http(s) URL, a mailto:/tel: link, a path starting with “/”, or a “#” anchor.',
  },
  {
    type: 'row',
    fields: [
      IconField({
        name: 'iconBefore',
        overrides: {
          admin: {
            width: '15%',
          },
        },
      }),
      TemplateField({
        name: 'label',
        label: 'Label',
        defaultValue: '{title}',
        description:
          'Defaults to the title of the linked document. Overwrite it with any text, or mix the two — `{title}` is substituted on render.',
        overrides: {
          required: true,
          admin: {
            width: '70%',
            components: {
              Field: {
                path: '@/fields/Link/components/LabelField',
              },
            },
          },
        },
      }),
      IconField({
        name: 'iconAfter',
        overrides: {
          admin: {
            width: '15%',
          },
        },
      }),
    ],
  },
  {
    // Read-only projection of `label` with `{title}` substituted. Rendered by
    // CMSLink, which is a client component and so cannot resolve it itself.
    name: 'resolvedLabel',
    type: 'text',
    virtual: true,
    admin: {
      hidden: true,
    },
    hooks: {
      afterRead: [
        renderLinkLabel,
      ],
    },
  },
  {
    name: 'iconOnly',
    type: 'checkbox',
    label: 'Icon only',
    admin: {
      description: 'Hides the label visually and uses it as the accessible name instead.',
    },
  },
  withAppearanceSelect
    ? {
        name: 'appearance',
        type: 'select',
        admin: {
          description: 'Choose how the link should be rendered.',
        },
        defaultValue: 'default',
        options: Object.values(appearanceOptions),
      }
    : false,
].filter(Boolean) as Field[],
```

Add the four new imports at the top of the file:

```ts
import { renderLinkLabel } from '@/fields/Link/hooks/renderLinkLabel'
import { isValidCustomURL } from '@/fields/Link/lib/isValidCustomURL'
import { TemplateField } from '@/fields/Template'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/fields/Link/index.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Regenerate types**

Run: `pnpm run payload generate:types`
Expected: succeeds under plain Node. If it fails on a `.css` import, a module in the config graph has picked up a transitive `@payloadcms/ui` import — check the imports added in Step 3 against the Global Constraints.

Confirm `LinkFieldData` in `src/types/payload.ts` now has `iconBefore`, `iconAfter`, `resolvedLabel` and no `type` / `icon`.

- [ ] **Step 6: Settle spec risk 2 — `afterRead` ordering**

Run: `pnpm dev`, then fetch a document containing a link:

```bash
curl -s 'http://localhost:3000/api/globals/site-settings?depth=2' | jq '.. | objects | select(has("resolvedLabel"))'
```

Expected: `resolvedLabel` holds the rendered title (e.g. `"About us"`), not the literal `{title}`.

If it holds `{title}`, the hook ran before relationship population. Apply the spec's documented fallback: in `renderLinkLabel`, when `resolveLinkTarget` yields a reference whose `value` is a bare id, look the title up via `req.payload.findByID({ collection: relationTo, id: value, depth: 0, select: { title: true }, req })`, and cache it on `req.context` under the same key convention used by `renderTemplate.core.ts`. Add a test for that branch alongside the existing ones in `renderLinkLabel.test.ts`.

- [ ] **Step 7: Settle spec risk 3 — narrow `select` call sites**

Run: `rg -n "select:" src/lib/fetchers src/components src/blocks --glob '*.ts*'`

For each result that selects link fields explicitly, add `resolvedLabel` to the selection — virtual fields are omitted from queries that pass an explicit `select`, and a missed call site renders a raw `{title}` on the page. If there are none, note that in the commit body.

- [ ] **Step 8: Commit**

```bash
pnpm exec biome check --write src/fields/Link src/types/payload.ts
git add src/fields/Link src/types/payload.ts
git commit -m "feat(link): unify target selection, template label and paired icons"
```

---

### Task 11: Update `CMSLink`

**Files:**
- Modify: `src/components/Link/index.tsx` (full rewrite of the component body)

**Interfaces:**
- Consumes: `resolveLinkTarget`, `CUSTOM_URL_SLUG` (Task 3); the new `LinkFieldData` shape (Task 10).
- Produces: no new exports; `CMSLink`'s props type widens with the regenerated `LinkFieldData`.

- [ ] **Step 1: Rewrite the component**

`src/components/Link/index.tsx`:

```tsx
import type React from 'react'
import Link from 'next/link'

import { Button, ButtonProps } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { CUSTOM_URL_SLUG, resolveLinkTarget } from '@/fields/Link/lib/resolveLinkTarget'
import { generateContentURL } from '@/lib/generateContentURL'
import type { LinkFieldData } from '@/types/payload'

type CMSLinkType = LinkFieldData & {
  children?: React.ReactNode
  className?: string
  newTab?: boolean
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    children,
    className,
    iconAfter,
    iconBefore,
    iconOnly,
    label,
    newTab,
    resolvedLabel,
    size,
    variant = 'link',
  } = props

  const target = resolveLinkTarget(props)

  if (!target) return null

  const href =
    target.relationTo === CUSTOM_URL_SLUG
      ? target.value
      : typeof target.value === 'object' && target.value.slug
        ? generateContentURL({
            collection: target.relationTo,
            slug: target.value.slug,
          })
        : null

  if (!href) return null

  // `resolvedLabel` is the virtual, template-rendered label. Falling back to
  // the raw `label` keeps a caller that queried with a narrow `select` from
  // rendering nothing — it renders the unsubstituted template instead, which
  // is visible enough to get reported.
  const text = resolvedLabel || label

  const newTabProps = newTab
    ? {
        rel: 'noopener noreferrer',
        target: '_blank',
      }
    : {}

  const hasIcon = Boolean(iconBefore || iconAfter)
  const showText = !(hasIcon && iconOnly)

  return (
    <Button
      className={className}
      size={size}
      variant={variant}
      {...(hasIcon && iconOnly
        ? {
            'aria-label': text,
          }
        : {})}
      asChild
    >
      <Link href={href} {...newTabProps}>
        {iconBefore && <Icon name={iconBefore} />}
        {showText && text && <span>{text}</span>}
        {showText && children}
        {iconAfter && <Icon name={iconAfter} />}
      </Link>
    </Button>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. Any error here means a call site still passes the removed `type` / `icon` props — fix those call sites rather than widening the type.

- [ ] **Step 3: Verify rendering in the browser**

Run: `pnpm dev` and open a page carrying a `LinkGroupBlock`, the header, and the footer.

Expected: links render with leading and trailing icons in the right order, labels show substituted titles rather than `{title}`, and an `iconOnly` link exposes its label as `aria-label` (check in the accessibility tree).

- [ ] **Step 4: Run the full suite**

Run: `pnpm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
pnpm exec biome check --write src/components/Link
git add src/components/Link
git commit -m "feat(link): render paired icons and resolved label in CMSLink"
```

---

### Task 12: Content migration

`icon` → `iconBefore`, and drop `type`. Small transform, awkward reach: links live in nested block arrays across `pages`, in `SiteSettings`, and inside lexical rich-text node JSON.

**Files:**
- Create: `src/lib/migrations/migrateLinkFields.ts`
- Create: `scripts/migrate-link-fields.ts`
- Modify: `package.json` (add the run script)
- Test: `src/lib/migrations/migrateLinkFields.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `migrateLinkFields(input: unknown): { value: unknown; changed: number }`.

The walker must only recurse into **plain** objects and arrays. Mongo documents carry `ObjectId` and `Date` values, and spreading those into plain objects would silently corrupt every document it touches.

- [ ] **Step 1: Write the failing test**

`src/lib/migrations/migrateLinkFields.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { migrateLinkFields } from './migrateLinkFields'

describe('migrateLinkFields', () => {
  it('renames icon to iconBefore and drops type', () => {
    const { value, changed } = migrateLinkFields({
      link: {
        type: 'reference',
        icon: 'simple-icons:github',
        label: 'GitHub',
        url: 'https://github.com',
      },
    })

    expect(changed).toBe(1)
    expect(value).toEqual({
      link: {
        iconBefore: 'simple-icons:github',
        label: 'GitHub',
        url: 'https://github.com',
      },
    })
  })

  it('rewrites links nested in block arrays', () => {
    const { value, changed } = migrateLinkFields({
      layout: [
        {
          blockType: 'LinkGroupBlock',
          links: {
            entries: [
              {
                link: {
                  type: 'custom',
                  icon: 'a',
                  label: 'One',
                  url: '/one',
                },
              },
              {
                link: {
                  type: 'custom',
                  icon: 'b',
                  label: 'Two',
                  url: '/two',
                },
              },
            ],
          },
        },
      ],
    })

    expect(changed).toBe(2)
    expect((value as never as Record<string, never>).layout[0].links.entries[0].link).toEqual({
      iconBefore: 'a',
      label: 'One',
      url: '/one',
    })
  })

  it('rewrites links inside lexical node json', () => {
    const { changed, value } = migrateLinkFields({
      content: {
        root: {
          children: [
            {
              type: 'link',
              fields: {
                type: 'reference',
                icon: 'x',
                label: 'Docs',
                reference: {
                  relationTo: 'pages',
                  value: 'p1',
                },
              },
              children: [],
            },
          ],
        },
      },
    })

    expect(changed).toBe(1)
    expect(
      (value as never as Record<string, never>).content.root.children[0].fields,
    ).toEqual({
      iconBefore: 'x',
      label: 'Docs',
      reference: {
        relationTo: 'pages',
        value: 'p1',
      },
    })
  })

  it('is idempotent', () => {
    const migrated = migrateLinkFields({
      link: {
        iconBefore: 'a',
        label: 'One',
        url: '/one',
      },
    })

    expect(migrated.changed).toBe(0)

    const again = migrateLinkFields(migrated.value)

    expect(again.changed).toBe(0)
    expect(again.value).toEqual(migrated.value)
  })

  it('does not overwrite an existing iconBefore', () => {
    const { value } = migrateLinkFields({
      link: {
        icon: 'old',
        iconBefore: 'new',
        label: 'One',
        url: '/one',
      },
    })

    expect((value as never as Record<string, never>).link).toEqual({
      iconBefore: 'new',
      label: 'One',
      url: '/one',
    })
  })

  it('leaves non-link objects untouched', () => {
    const input = {
      meta: {
        icon: 'a',
        type: 'b',
      },
    }

    const { value, changed } = migrateLinkFields(input)

    expect(changed).toBe(0)
    expect(value).toEqual(input)
  })

  it('preserves non-plain values by reference', () => {
    class ObjectIdStub {
      constructor(readonly id: string) {}
    }

    const _id = new ObjectIdStub('abc')
    const createdAt = new Date('2026-01-01T00:00:00.000Z')

    const { value } = migrateLinkFields({
      _id,
      createdAt,
      link: {
        icon: 'a',
        label: 'One',
        url: '/one',
      },
    })

    const output = value as never as Record<string, unknown>

    expect(output._id).toBe(_id)
    expect(output.createdAt).toBe(createdAt)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/migrations/migrateLinkFields.test.ts`
Expected: FAIL — `Failed to resolve import "./migrateLinkFields"`.

- [ ] **Step 3: Write the implementation**

`src/lib/migrations/migrateLinkFields.ts`:

```ts
/**
 * Only literal `{}` objects are rebuilt. Mongo documents carry `ObjectId`,
 * `Date` and `Buffer` values whose prototypes would be stripped by a naive
 * spread, silently corrupting every document the walker touches.
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

/**
 * Structural test for "this object is a link". Links appear under several
 * different keys — `link`, lexical's `fields`, array entries — so shape is
 * the only reliable signal.
 */
const isLinkShaped = (value: Record<string, unknown>): boolean =>
  'label' in value && ('reference' in value || 'url' in value || 'type' in value)

/**
 * Rewrites every link-shaped object in a document to the post-unification
 * shape: `icon` becomes `iconBefore`, and the now-removed `type` discriminator
 * is dropped.
 *
 * Pure and idempotent — an object already carrying `iconBefore` and no `type`
 * is returned unchanged and not counted.
 */
export const migrateLinkFields = (input: unknown): { value: unknown; changed: number } => {
  let changed = 0

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)

    if (!isPlainObject(node)) return node

    const next: Record<string, unknown> = {}

    for (const [
      key,
      value,
    ] of Object.entries(node)) {
      next[key] = walk(value)
    }

    if (!isLinkShaped(next)) return next

    let touched = false

    if ('type' in next) {
      delete next.type
      touched = true
    }

    if ('icon' in next) {
      if (next.iconBefore === undefined) next.iconBefore = next.icon
      delete next.icon
      touched = true
    }

    if (touched) changed += 1

    return next
  }

  return {
    value: walk(input),
    changed,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/migrations/migrateLinkFields.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Write the migration script**

`scripts/migrate-link-fields.ts`, following `scripts/migrate-skill-name-caption.ts`:

```ts
/**
 *    Migrates stored links to the unified-target shape:
 *
 *      icon  ->  iconBefore
 *      type  ->  (removed — the target select derives it from
 *                 reference/url instead)
 *
 *    Usage:
 *      pnpm links:migrate
 *
 *    Run this once, immediately after deploying the `LinkField` change (see
 *    `src/fields/Link/index.ts`) — the schema change and this script are one
 *    unit of work, not independently orderable.
 *
 *    Reads and writes the raw MongoDB collections directly
 *    (`payload.db.connection`), bypassing Payload's field-aware local API:
 *    links are buried in block arrays and lexical node JSON, so a
 *    field-aware read would drop the very keys this migration needs to see.
 *    It also means no `afterChange` hooks fire — in particular no
 *    revalidation. Trigger one manually after this finishes.
 *
 *    Safe to re-run: documents with nothing left to rewrite are skipped.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { migrateLinkFields } from '@/lib/migrations/migrateLinkFields'
import { CollectionSlug } from '@/types/collections'

const payload = await getPayload({
  config,
})

/** Every store that can contain a link, including the globals collection. */
const TARGET_COLLECTIONS = [
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
  'globals',
]

let migratedDocs = 0
let migratedLinks = 0
let skipped = 0

for (const collectionName of TARGET_COLLECTIONS) {
  const collection = payload.db.connection.collection(collectionName)
  const docs = await collection.find({}).toArray()

  for (const doc of docs) {
    const { _id, ...rest } = doc
    const { value, changed } = migrateLinkFields(rest)

    if (changed === 0) {
      skipped += 1
      continue
    }

    await collection.replaceOne(
      {
        _id,
      },
      {
        _id,
        ...(value as Record<string, unknown>),
      },
    )

    migratedDocs += 1
    migratedLinks += changed
  }
}

console.info(
  `Migrated ${migratedLinks} link(s) across ${migratedDocs} document(s), skipped ${skipped} (nothing to rewrite).`,
)
process.exit(0)
```

- [ ] **Step 6: Add the package script**

In `package.json`, alongside `skills:migrate-name-caption`:

```json
"links:migrate": "pnpm run payload run scripts/migrate-link-fields.ts",
```

- [ ] **Step 7: Verify the globals collection name**

The script assumes Payload's mongoose adapter stores globals in a collection literally named `globals`. Confirm before running against real data:

```bash
pnpm run payload run -e "console.log((await (await import('payload')).getPayload({ config: (await import('@payload-config')).default }).then(p => p.db.connection.db.listCollections().toArray())).map(c => c.name))"
```

If the name differs, correct `TARGET_COLLECTIONS`. If globals are stored per-slug, list each slug instead.

- [ ] **Step 8: Dry-run against a dump, then run**

Restore a production dump into a scratch database, point `DATABASE_URI` at it, and run:

Run: `pnpm links:migrate`
Expected: a non-zero migrated count and no errors. Spot-check one page and the site settings in the admin: links keep their icons in the leading slot, and the target select shows the right document or URL.

Then run it against the real database.

- [ ] **Step 9: Commit**

```bash
pnpm exec biome check --write src/lib/migrations scripts/migrate-link-fields.ts package.json
git add src/lib/migrations scripts/migrate-link-fields.ts package.json
git commit -m "feat(link): migrate stored links to the unified target shape"
```

---

### Task 13: Full verification

**Files:**
- No production changes expected. Fix whatever this surfaces.

- [ ] **Step 1: Run the full unit suite**

Run: `pnpm test`
Expected: all tests pass.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `pnpm exec biome check src`
Expected: no diagnostics.

- [ ] **Step 4: Build**

Run: `pnpm run payload build`
Expected: import map and types generate, then `next build` succeeds.

- [ ] **Step 5: End-to-end smoke**

Run: `pnpm test:e2e`
Expected: the existing suite passes. If any spec drives the old link UI (a `type` radio, a separate URL input), update it to drive the select instead.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(link): address verification findings"
```

---

## Notes for the reviewer

- **Task 1 is a gate, not a formality.** If the custom Field component does not render in lexical's link drawer, Tasks 8–11 need rethinking before they are written.
- **Task 10 Step 6 and Step 7** settle the two remaining spec risks. Neither can be settled from reading code alone — both need a running server.
- **Task 12 Step 8** touches production data. Do the dump dry-run.

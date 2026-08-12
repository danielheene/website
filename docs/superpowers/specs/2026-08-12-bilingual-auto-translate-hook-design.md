# `BilingualRichTextField` auto-translate hook

Status: approved, ready for implementation plan
Date: 2026-08-12

## Motivation

`BilingualRichTextField` (shipped 2026-08-11, see
`docs/superpowers/specs/2026-08-11-bilingual-richtext-field-design.md`)
exposes two manual translate buttons between the `en` and `de` fields. The
button is fine for the "I typed English and want to translate it right now"
case, but the more common flow is: an admin opens `ResumeJobs`, adds several
tasks in a row, types only the language they think in, saves, and comes back
later. Today, each of those save operations leaves half of the bilingual
data permanently blank unless the admin remembers to click every translate
button before saving.

This spec adds a background auto-translate that fills the missing side on
save, once, without changing anything else about the field's behavior. It's
"always on" for every consumer of `BilingualRichTextField` (no opt-in prop)
— matching the "always on" choice made during brainstorming — with the
standard `req.context.skipAutoTranslate` escape hatch used by 10+ other
hooks in this repo.

## Goals

1. On save, if one language side of a `BilingualRichTextField` is populated
   and the other is empty (and was also empty before this save), enqueue a
   background job that translates the populated side into the empty one and
   patches the document.
2. Reuse the existing `fetchAnthropicTranslation` server action verbatim —
   this is a scheduling change, not a translation-engine change.
3. Reuse the existing Payload jobs-queue infrastructure and follow the same
   workflow/task/queue shape already established by
   `src/jobs-queue/workflows/generateResumeDocument.tsx`.
4. Never overwrite user work. Once a user has cleared a language field and
   saved, subsequent saves do not re-fill it.
5. Never fail a save because of a translation problem. The save has already
   returned by the time translation runs.

## Non-goals

- Making translation synchronous. The Claude round-trip takes several
  seconds; blocking saves that long would be a UX regression. Handled
  entirely via the jobs queue.
- A per-call-site opt-out prop on `BilingualRichTextField`. The escape
  hatch is `req.context.skipAutoTranslate = true`, matching the repo's
  `skipGenerateResumeDocumentHook` / `skipRevalidate` /
  `skipUpdateCachedData` pattern. Add a prop later if a real need emerges.
- Cost or usage accounting. This is background AI usage; if that becomes a
  concern, the right layer is either a rate limiter inside
  `fetchAnthropicTranslation` or a per-collection setting — both out of
  scope here.
- Supporting anything other than `en`/`de`. Inherited from the base field's
  fixed-two-language design.

## Design

### 1. The trigger — a field-level `afterChange` hook on the returned group

`BilingualRichTextField` today returns a `GroupField` with `hooks`
unspecified. Add an `afterChange` hook to that group. Payload field hooks
receive `{ value, previousValue, siblingData, previousSiblingData, req,
operation, path, collection, context, … }` — everything the enqueue
decision needs.

Per-direction fire condition (evaluated once for `en→de`, once for `de→en`):

```
enqueue iff
    context?.skipAutoTranslate !== true               // escape hatch
  && !isEmptyValue(value[source])                     // source populated
  && isEmptyValue(value[target])                      // target empty now
  && isEmptyValue(previousValue?.[target])            // target empty in prior save too
  && collection?.slug                                 // this is a collection field
  && (data?.id ?? req.routeParams?.id)                // doc has an ID (afterChange on create → after doc write)
```

The "previous target was also empty" clause is what makes this feature
non-destructive: it fires exactly once, when the target field transitions
from "never populated" to "still empty after a save with content on the
other side." A user who later deletes the German content sees
`previousValue.de` as populated on the next save, so the hook does not
re-fill.

If both conditions fire in the same save (both sides populated after having
been both empty — impossible in practice unless a user pastes both at
once), both jobs enqueue and both no-op on empty-target check.

### 2. The workflow — mirrors `generateResumeDocument` shape

New files:
- `src/jobs-queue/workflows/autoTranslateBilingualField.tsx`
- `src/jobs-queue/tasks/autoTranslateBilingualField.ts`

New enum members in `src/types/jobs-queue.ts`:
- `WorkflowSlug.AutoTranslateBilingualField = 'AutoTranslateBilingualField'`
- `TaskSlug.AutoTranslateBilingualField = 'AutoTranslateBilingualField'`
- `QueueSlug.AutoTranslate = 'auto-translate'`

Workflow config:
```ts
export const autoTranslateBilingualField: WorkflowConfig<WorkflowSlug['AutoTranslateBilingualField']> = {
  slug: WorkflowSlug.AutoTranslateBilingualField,
  queue: QueueSlug.AutoTranslate,
  concurrency: {
    // per-target-cell key: newer save on the same field supersedes an in-flight job for it
    key: ({ input }) =>
      `${input.collectionSlug}:${input.docId}:${input.path}:${input.targetLanguage}`,
    supersedes: true,
    exclusive: true,
  },
  inputSchema: [
    { type: 'text', name: 'collectionSlug', required: true },
    { type: 'text', name: 'docId', required: true },
    { type: 'text', name: 'path', required: true },        // dot-notation, e.g. 'tasks.0.task'
    { type: 'text', name: 'sourceLanguage', required: true },
    { type: 'text', name: 'targetLanguage', required: true },
    { type: 'json', name: 'sourceValue', required: true }, // the SerializedEditorState to translate
    { type: 'number', name: 'maximumRetries', required: true },
  ],
  handler: async ({ tasks, job: { input }, req: { payload } }) => {
    'use server'
    await tasks.AutoTranslateBilingualField(
      `${TaskSlug.AutoTranslateBilingualField}:${input.docId}:${input.path}:${input.targetLanguage}`,
      {
        retries: {
          attempts: input.maximumRetries,
          backoff: { delay: secondsToMilliseconds(15), type: 'exponential' },
        },
        input,
      },
    )
  },
}
```

Task body (concise sketch — full code in the implementation plan):
```ts
async function handler({ input, req: { payload } }) {
  // 1. Re-check: has someone (the user, another job) already filled the target?
  const doc = await payload.findByID({ collection: input.collectionSlug, id: input.docId })
  const currentTarget = get(doc, `${input.path}.${input.targetLanguage}`)
  if (!isEmptyValue(currentTarget)) return { output: { skipped: 'target-already-populated' } }

  // 2. Translate.
  const translated = await fetchAnthropicTranslation({
    value: input.sourceValue,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
  })
  if (!translated) return { output: { skipped: 'empty-translation' } }

  // 3. Patch the doc in place at the exact path.
  const nextDoc = cloneDeep(doc)
  set(nextDoc, `${input.path}.${input.targetLanguage}`, translated)

  await payload.update({
    collection: input.collectionSlug,
    id: input.docId,
    data: nextDoc,
    context: { skipAutoTranslate: true }, // <-- prevents re-entry
  })

  return { output: { success: true } }
}
```

The `payload.update` uses `context: { skipAutoTranslate: true }` so the
same afterChange hook this workflow was triggered by does not re-fire on
the writeback. Standard repo pattern.

### 3. Enqueue hook — `src/fields/BilingualRichText/hooks/enqueueAutoTranslate.ts`

Small, focused, testable. Shape:

```ts
export const enqueueAutoTranslate: GroupFieldAfterChangeHook = async ({
  value,
  previousValue,
  data,
  req,
  operation,
  path,
  collection,
  context,
}) => {
  if (context?.skipAutoTranslate) return value
  if (!collection?.slug) return value                    // not a collection field
  if (operation !== 'create' && operation !== 'update') return value

  const docId = data?.id ?? req.routeParams?.id
  if (!docId) return value

  const enqueue = (source: 'en' | 'de', target: 'en' | 'de') =>
    req.payload.jobs.queue({
      workflow: WorkflowSlug.AutoTranslateBilingualField,
      queue: QueueSlug.AutoTranslate,
      input: {
        collectionSlug: collection.slug,
        docId: String(docId),
        path: path.join('.'),                            // Payload gives path as string[]
        sourceLanguage: source,
        targetLanguage: target,
        sourceValue: value[source],
        maximumRetries: 3,
      },
    })

  const shouldFill = (source: 'en' | 'de', target: 'en' | 'de') =>
    !isEmptyValue(value?.[source]) &&
    isEmptyValue(value?.[target]) &&
    isEmptyValue(previousValue?.[target])

  const jobs = []
  if (shouldFill('en', 'de')) jobs.push(enqueue('en', 'de'))
  if (shouldFill('de', 'en')) jobs.push(enqueue('de', 'en'))
  await Promise.all(jobs)

  return value
}
```

Attached to the group field in `BilingualRichTextField`:
```ts
return {
  type: 'group',
  name,
  label,
  admin: { hideGutter: true },
  hooks: { afterChange: [enqueueAutoTranslate] },
  fields,
}
```

### 4. Extract `isEmptyValue` to a shared module

`isEmptyValue` currently lives as a private function inside
`src/fields/BilingualRichText/components/TranslateControls.tsx`. The
enqueue hook and the task both need it too, and neither can import from a
`'use client'` module.

Move it to a new file `src/lib/lexical/isEmptyValue.ts` (same folder as
`parseHtmlToLexical.ts` — same domain, same import shape). Both
`TranslateControls.tsx` and the two new files import from there. Existing
`TranslateControls` tests keep passing unchanged (they exercise the same
function through the same component surface).

### 5. Registration

- Add `autoTranslateBilingualField` to `src/jobs-queue/workflows/index.ts`
  (the `WORKFLOWS` array).
- Add its queue to `payload.config.ts`'s `jobs.autoRun` config (matches
  the existing `ResumeGeneration` queue polling setup).

## Reused code (no new invention)

| Reuse | Source |
| --- | --- |
| `fetchAnthropicTranslation` | `src/lib/fetchAnthropicTranslation.ts` (unchanged) |
| `parseHtmlToLexical`, `convertLexicalToHTML` | already used by translation (unchanged) |
| Workflow / task / queue registration pattern | `src/jobs-queue/workflows/generateResumeDocument.tsx` |
| `lodash-es` `get`/`set`/`cloneDeep` | already used elsewhere (`src/lib/renderTemplate.ts`, `src/fields/Meta/…`, `src/collections/…`) |
| `req.context.skip<Hook>` escape-hatch shape | 10+ existing hooks (`skipGenerateResumeDocumentHook`, `skipRevalidate`, `skipUpdateCachedData`, …) |
| `payload.jobs.queue({ workflow, queue, input })` API | called from `enqueueGenerateResumeDocument.ts` |

## Behaviors worth naming

- **Save latency is unchanged.** The enqueue call is a fast local write; the
  Claude call and the second `payload.update` run in the background.
- **Admin UI eventual consistency.** After a save that triggers auto-translate,
  the admin form shows the target field still empty for as long as the job
  takes to run (typically 3-8s). A page refresh reveals the populated
  value. Not adding a live-update mechanism — that's a separate feature.
- **Concurrency.** The workflow's `concurrency.key` is
  `<collection>:<docId>:<path>:<targetLanguage>`, so rapid consecutive
  saves on the same field supersede in-flight jobs — only the latest wins.
  Jobs for unrelated docs/fields run concurrently.
- **Idempotency.** The task re-checks emptiness against the current doc
  before translating. If a user manually typed the target between enqueue
  and job run, the job no-ops with `skipped: 'target-already-populated'`.
- **Failure.** If translation fails, the retry backoff kicks in (3 attempts,
  exponential from 15s). After exhaustion, the target field remains empty
  and the failure is logged via `payload.logger.error`. No visible admin
  surface for these failures yet — worth a follow-up but out of scope here.
- **`ANTHROPIC_API_KEY` missing.** The task fails and logs the friendly
  error `fetchAnthropicTranslation` already throws in that case. The
  enqueue hook does not pre-check the env var — keeps the enqueue path
  synchronous and cheap; the failure surfaces at job run.
- **Cost.** Every save of a `BilingualRichTextField` with a first-time
  one-sided entry costs one Claude call per empty side. All current
  consumers (only `ResumeJobs.tasks` today) get this behavior
  automatically.
- **Interaction with the manual translate button.** If a user clicks the
  button before saving, the save sees both sides populated and the hook
  no-ops. Zero conflict.

## Testing

- Unit test `enqueueAutoTranslate` in isolation with mocked
  `req.payload.jobs.queue`: assert the correct `input` is enqueued for
  each of the three shouldFill cases (en→de, de→en, both) and the four
  no-op cases (both empty, both populated, context skip, previous target
  populated).
- Unit test the shared `isEmptyValue` (currently exercised only through
  `TranslateControls.test.tsx`'s 6 tests — the extraction gets its own
  focused tests too).
- Unit test the task handler with mocked `fetchAnthropicTranslation` and
  mocked `payload.findByID` / `payload.update`: assert (a) the pre-flight
  emptiness re-check no-ops when target is now populated, (b) `set` writes
  the translated value at the correct nested path, (c) the writeback
  update carries `context: { skipAutoTranslate: true }`.
- No end-to-end test — matches the existing convention for job-queue
  workflows in this repo (`generateResumeDocument` has no e2e test either,
  only its constituent pieces).

## Open items for the implementation plan

- Exact type name for the field afterChange hook signature (Payload
  exports `GroupField['hooks']['afterChange'][number]` or similar — pin
  it precisely in the plan).
- Whether `path` from the hook is `string[]` or `string`. Payload 3.87
  exports it as `string[]`; the plan should show `path.join('.')` in the
  enqueue and stringly-typed `path: string` on the workflow input.
- Precise import for `cloneDeep` — repo already uses `lodash-es` for
  `get`, so `import { cloneDeep, get, set } from 'lodash-es'` is right.

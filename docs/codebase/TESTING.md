# Testing Patterns

## Core Sections (Required)

### 1) Test Stack and Commands

- Primary test framework: Node.js built-in test runner (`node:test`) — no Jest/Vitest/Mocha dependency in any workspace `package.json`. Documented in `README.md:117-124` and `.junie/guidelines.md` ("Testing" section).
- Assertion/mocking tools: `node:assert/strict` (per the documented example); no dedicated mocking library found.
- Commands:

```bash
node --test                       # run all discovered *.test.{js,mjs,cjs} files
node --test tests/filename.test.js  # run a specific test file
```

- **No `test` script exists in any `package.json`** (root, `web/`, or `storybook/`) — these commands must be run manually; there is no `pnpm test`. **[TODO]** confirm whether this is intentional or a gap.

### 2) Test Layout

- Documented placement pattern: `tests/` directory at the repo root, or co-located with source using a `.test.js` suffix (`README.md:117-124`).
- Naming convention: `*.test.js` (ESM; `package.json` root `type` is not `module` but `web/package.json:7` and `storybook/package.json:5` both set `"type": "module"`).
- Setup files: none found.
- **Current reality**: `tests/` exists as an empty directory (confirmed via `find tests -type f` — no output) and no `*.test.js`/`*.test.ts` files exist anywhere else in the repository. All documentation of the Node test runner (`README.md`, `.junie/guidelines.md`) describes a **demonstration** test (`tests/math.js` / `tests/math.test.js`) that was explicitly created, run once to verify the workflow, and then deleted (`.junie/guidelines.md`: "Temporary demonstration test files used for verification were removed after documenting these steps to keep the repo clean.").

### 3) Test Scope Matrix

| Scope | Covered? | Typical target | Notes |
|-------|----------|----------------|-------|
| Unit | No | — | Zero test files currently in the repo |
| Integration | No | — | No Payload/API integration tests found |
| E2E | No (tooling present, unused) | — | `playwright` is a `web/package.json` dependency (`^1.59.1`), but `@playwright/test` is **not** installed and no `playwright.config.ts`/`e2e/` directory exists — `.junie/guidelines.md` explicitly notes this as a possible future addition, not a current capability |

### 4) Mocking and Isolation Strategy

- Main mocking approach: **[TODO]** — no test files exist to derive a real pattern from; not established.
- Isolation guarantees: **[TODO]** — not established.
- Common failure mode in tests: **[TODO]** — not applicable, no tests exist to fail.

### 5) Coverage and Quality Signals

- Coverage tool + threshold: none configured (no `.nycrc`, no `c8`/`istanbul` config, no coverage flag on `node --test`).
- Current reported coverage: 0% by absence — no tests exist.
- Known gaps/flaky areas: the entire application (Payload collections/hooks, block renderers, PDF generation, jobs queue, API routes) is currently **untested**. Given the churn in `src/blocks/ResumeAboutMeBlock`, `src/blocks/ResumeDownloadsBlock/Renderer`, `src/blocks/ResumeExperienceBlock/Renderer`, and `src/types/blocks.ts` (4 changes each in the last 90 days per the scan), these are the highest-value areas to test first.

### 6) Evidence

- `README.md:117-124`
- `.junie/guidelines.md` ("Testing" section)
- `web/package.json`, `storybook/package.json`, root `package.json` (no `test` script in any)
- Empty `tests/` directory (confirmed via filesystem scan)

## Extended Sections (Optional)

Not populated — there is no existing test suite to catalog framework-specific patterns, mock recipes, or flaky-test history from.

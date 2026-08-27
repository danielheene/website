/**
 * Conventional Commits, enforced on the commit-msg hook.
 *
 * The repo already follows this convention (28 of the last 30 commits matched
 * before this was added), so the rules mostly stop drift rather than impose a
 * new style.
 *
 * Scopes are intentionally unrestricted: the ones in use — fonts, storybook,
 * ci, sse, richtext, pdf, codeblock, admin — track areas of the codebase that
 * keep changing, and a fixed allowlist would need editing more often than it
 * would catch a genuine mistake.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
    /**
     * Bodies are where the *why* lives, so the subject can stay short. 100 is
     * the conventional default; the header limit is the one that actually
     * bites, and wrapping is handled by the editor rather than a hard error.
     */
    'body-max-line-length': [
      0,
      'always',
    ],
    'footer-max-line-length': [
      0,
      'always',
    ],

    /** Longer than this stops being scannable in `git log --oneline`. */
    'header-max-length': [
      2,
      'always',
      100,
    ],

    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
}

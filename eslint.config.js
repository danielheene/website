import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    languageOptions: {
      globals: {
        process: 'readable',
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'ignores',
    ignores: [
      '.eslintrc.js',
      '**/.git',
      '**/.hg',
      '**/.pnp.*',
      '**/.svn',
      '**/.yarn/**',
      '**/.storybook/**',
      '**/stories/**',
      '**.stories.**',
      '**/build/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/temp/**',
      '**/migrations/**',
    ],
  },
  {
    name: 'typescript',
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: 'readable',
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]

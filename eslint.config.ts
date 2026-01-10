import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  globalIgnores(['dist/']),
  {
    files: ['**/*.{js,ts}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.browser,
        ...globals.jquery,
        mw: 'readonly',
      },
    },
  },
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
  }),
  {
    rules: {
      'block-scoped-var': 'error',
      'camelcase': ['error', { properties: 'always' }],
      'eol-last': 'error',
      'max-len': ['warn', {
        code: 100,
        tabWidth: 4,
        ignorePattern: '^[\\s]*(//|<!--) (es|style)lint-.+',
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
      'prefer-arrow-callback': 'error',
      'no-useless-rename': 'error',
      'sort-imports': ['error', {
        ignoreDeclarationSort: true,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      }],
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@stylistic/spaced-comment': ['error', 'always', {
        markers: ['!'],
      }],
    },
  },
]);

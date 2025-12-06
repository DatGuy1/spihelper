import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  globalIgnores(['dist/']),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        mw: 'readonly',
      },
    },
  },
  ...tseslint.configs.recommended,
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
    },
  },
]);

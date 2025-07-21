import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import prettier from 'eslint-plugin-prettier';
import securityPlugin from 'eslint-plugin-security';
import unicornPlugin from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  securityPlugin.configs.recommended,
  {
    plugins: { js },
    files: ['**/*.{js,ts}'],
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': [
        1,
        {
          semi: true,
          tabWidth: 2,
          endOfLine: 'lf',
          printWidth: 180,
          singleQuote: true,
          trailingComma: 'es5',
          jsxSingleQuote: true,
          bracketSpacing: true,
        },
      ],
    },
  },
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/empty-brace-spaces': 'off',
      'unicorn/no-null': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);

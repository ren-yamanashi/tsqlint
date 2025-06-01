import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      importPlugin.flatConfigs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      'import/no-unresolved': 'off',
      'import/named': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      'import/no-duplicates': 'error',
      'import/order': [
        'warn',
        {
          alphabetize: { order: 'asc' },
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-misused-spread': 'off',
    },
  },
  {
    ignores: ['dist', 'node_modules', '.vscode', 'package.json', 'vitest.config.ts', '*.js'],
  },
);

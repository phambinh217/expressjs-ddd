import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

/**
 * Nền: @eslint/js + typescript-eslint recommended + eslint-config-prettier; phần rules dưới cùng
 * ép các luật trong docs/coding-conventions/ mà ESLint kiểm được (format để Prettier lo).
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    /**
     * File CommonJS do sequelize-cli đọc (config, migration, seeder) — không lint.
     */
    ignores: ['dist/**', 'node_modules/**', 'src/config/**', 'src/migrations/**', 'src/seeders/**'],
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: ':not(MethodDefinition) > FunctionExpression',
          message: 'Use an arrow function instead of a function expression.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**'],
              message: "Import from another directory via the '@/...' alias, never '../'.",
            },
          ],
        },
      ],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
)

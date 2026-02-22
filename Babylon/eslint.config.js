import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default {
  files: ['**/*.ts'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tsParser
  },
  plugins: {
    '@typescript-eslint': tsEslintPlugin
  },
  rules: {
    // Add custom rules here if needed.
  },
  ignores: ['node_modules/', 'dist/', 'build/']
}

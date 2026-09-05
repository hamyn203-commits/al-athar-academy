import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `platform/` is the V2 scaffold and is out of scope per AGENTS.md.
  globalIgnores(['dist', 'backend', 'platform', 'deploy-folder']),

  // Browser application source.
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, process: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // Node-side files: build config, static server, scripts.
  {
    files: ['*.{js,mjs}', 'scripts/**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, __dirname: 'readonly' },
    },
  },

  // Service worker runs in its own global scope.
  {
    files: ['public/sw.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
])

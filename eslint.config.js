// ESLint flat config (ESLint 9).
//
// package.json has defined `npm run lint` since the project started, but no
// config file existed, so the script always failed. This covers the Express
// server; the React app is linted by react-scripts during its own build.

'use strict';

module.exports = [
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        fetch: 'readonly'
      }
    },
    rules: {
      // Correctness — these catch the class of bug found during the audit.
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-undef': 'error',
      'no-const-assign': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-unreachable': 'error',
      'no-fallthrough': 'error',
      'valid-typeof': 'error',
      'use-isnan': 'error',

      // Mixing `||` with `?:` without parentheses produced a real bug in
      // routes/comparisons.js (dividend_per_share was silently never used).
      'no-mixed-operators': ['warn', {
        groups: [
          ['&&', '||'],
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['+', '-', '*', '/', '%', '**']
        ],
        allowSamePrecedence: true
      }],
      'no-nested-ternary': 'warn',

      // Async correctness
      'require-atomic-updates': 'warn',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'off',

      // Style — kept light so the existing codebase isn't drowned in warnings.
      eqeqeq: ['warn', 'smart'],
      'no-var': 'warn',
      'prefer-const': 'warn'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'frontend/**',
      'mobile_app/**',
      'server/data/**',
      'db/**',
      '**/*.min.js'
    ]
  }
];
